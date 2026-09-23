import { ListObjectsV2Command, type ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import Cache from 'node-cache'
import { defineEventHandler, createError } from 'h3'
import { readDataAsset } from '../utils/data'
import { getBucket, getR2Client, hasR2Config } from '../utils/r2'
import { CHANNELS, parseImagePath, type Channel } from '../../utils/image-path'

// --- Types ---
interface ImageInfo {
  path: string;
  timestamp: Date;
  size: number;
  checksum: string | null;
}

interface StorageEntry {
  key: string;
  timestamp: Date;
  size: number;
}

// A storage object narrowed to the fields a StorageEntry needs (see the
// type-guard filter in listChannel), which lets the map drop non-null assertions.
type StorageObject = NonNullable<ListObjectsV2CommandOutput['Contents']>[number];
type ListedObject = StorageObject & { Key: string; LastModified: Date; Size: number };

// Cache the listing rather than the clients; those are shared (and rebuilt on
// credential rollover) in server/utils/r2.ts.
const cache = new Cache({ stdTTL: 60 * 10 }); // 10 minute TTL

function findChecksum(key: string, keys: Set<string>): string | null {
  const checksum = `${key}.sha256.txt`;
  return keys.has(checksum) ? checksum : null;
}

function shapeEntries(channel: Channel, entries: StorageEntry[]): ImageInfo[] {
  const keys = new Set(entries.map(entry => entry.key));

  return entries.flatMap((entry) => {
    const parsed = parseImagePath(entry.key);
    if (!parsed || parsed.channel !== channel) return [];
    return [{
      path: entry.key,
      timestamp: entry.timestamp,
      size: entry.size,
      checksum: findChecksum(entry.key, keys),
    }];
  });
}

type DevelopmentImages = Partial<Record<Channel, { key: string; timestamp: string; size: number }[]>>;

async function loadDevelopmentImages(): Promise<ImageInfo[]> {
  try {
    const data = await readDataAsset<DevelopmentImages>('development-images.json5');
    if (!data) return [];
    return CHANNELS.flatMap(channel => shapeEntries(channel, (data[channel] ?? []).map(entry => ({
      key: entry.key,
      timestamp: new Date(entry.timestamp),
      size: entry.size,
    }))));
  } catch (err) {
    console.error('Failed to load development-images.json5:', err);
    return []; // Return empty array if dev data fails
  }
}

async function listChannel(channel: Channel): Promise<ImageInfo[]> {
  const client = getR2Client(channel);
  const bucket = getBucket(channel);
  const allContents: NonNullable<ListObjectsV2CommandOutput['Contents']> = [];
  let continuationToken: string | undefined;

  try {
    do {
      const command = new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken });
      const data = await client.send(command);
      if (data.Contents) {
        allContents.push(...data.Contents);
      }
      continuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (continuationToken);

    const entries = allContents
      .filter((obj): obj is ListedObject =>
        !!obj.Key && obj.LastModified != null && obj.Size != null)
      .map(obj => ({ key: obj.Key, timestamp: obj.LastModified, size: obj.Size }));

    return shapeEntries(channel, entries);
  } catch (error) {
    console.error(`Error listing objects from R2 bucket for ${channel}:`, error);
    throw createError({ statusCode: 502, statusMessage: `Failed to retrieve ${channel} image list from storage.` });
  }
}

async function listImages(): Promise<ImageInfo[]> {
  const listings = await Promise.all(CHANNELS.map(listChannel));
  return listings.flat();
}

async function getImages(): Promise<ImageInfo[]> {
  const cacheKey = 'images';
  const cachedImages = cache.get<ImageInfo[]>(cacheKey);
  if (cachedImages) {
    console.log('Returning cached images data.');
    return cachedImages;
  }

  // Determine if remote storage should be used:
  // - Always in production.
  // - In development, only if every channel is configured.
  const r2Configured = CHANNELS.every(hasR2Config);
  const shouldUseR2 = process.env.NODE_ENV === 'production' || r2Configured;

  if (shouldUseR2 && !r2Configured) {
    console.error('[API /images] R2 is required but not fully configured (see R2_ENDPOINT, R2_*_BUCKET and the access keys).');
  }

  if (shouldUseR2) {
    try {
      console.log('Attempting to fetch images data from R2...');
      // getR2Client() throws if a channel's configuration is incomplete.
      // listChannel() catches other storage errors and re-throws them as createError.
      const images = await listImages();
      cache.set(cacheKey, images);
      console.log(`Fetched and cached ${images.length} images from R2.`);
      return images;
    } catch (storageError) {
      const e = storageError as { message?: string; statusMessage?: string; statusCode?: number };
      console.error('R2 fetch failed:', e.message || e.statusMessage || storageError);

      // In production this is a hard error; listChannel or getR2Client should
      // already have thrown an h3 error, but ensure one is thrown regardless.
      if (process.env.NODE_ENV === 'production') {
        if (e.statusCode) throw storageError; // Re-throw if already an h3 error
        throw createError({ statusCode: 503, statusMessage: 'Failed to retrieve image list from R2 in production.', data: e.message });
      }

      // In development, if R2 fails (e.g. credentials present but invalid, or a
      // network issue), fall through to development data.
      console.warn('R2 fetch failed in development. Falling back to local development images data.');
    }
  }

  // Fallback for:
  // 1. Non-production environment AND R2 is NOT fully configured.
  // 2. Non-production environment AND R2 IS configured BUT the fetch failed.
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using local development images data (R2 not configured, or the R2 fetch failed in dev).');
    const devImages = await loadDevelopmentImages();
    // Cache dev images too, to avoid frequent file reads.
    cache.set(cacheKey, devImages);
    return devImages;
  }

  // This point should ideally not be reached in production if R2 failed,
  // as an error should have been thrown. This is a safeguard.
  console.error('Critical: Image data source unavailable. No images could be loaded.');
  throw createError({ statusCode: 500, statusMessage: 'Image data source unavailable.' });
}

// --- Event Handler ---
export default defineEventHandler(async () => {
  try {
    const images = await getImages();
    return images;
  } catch (error) { // Catch potential errors from getImages (like storage config errors)
    // Log the caught error for debugging
    console.error('Error in /api/images endpoint:', error);

    // If it's an error created by createError, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    // Otherwise, wrap it
    const message = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while fetching image data.',
      data: message
    });
  }
});
