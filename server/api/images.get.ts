import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3'
import Cache from 'node-cache'
import { defineEventHandler, createError } from 'h3'
import JSON5 from 'json5'
import fs from 'node:fs'
import path from 'node:path'

// --- Types ---
interface ImageInfo {
  path: string;
  timestamp: Date;
  size: number;
}

// --- Configuration & Initialization ---
const spacesKey = process.env.SPACES_KEY;
const spacesSecret = process.env.SPACES_SECRET;

if (!spacesKey || !spacesSecret) {
  // Log error only in non-production, throw generic error in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Missing SPACES_KEY or SPACES_SECRET environment variables for S3 access.');
  }
  // We might allow the app to run without S3 in dev using dev data, so don't throw here yet.
  // Throwing later if S3 access is actually attempted in production without keys.
}

// Use singleton pattern for cache and S3 client to avoid re-initialization on every request
let s3: S3Client | null = null;
const cache = new Cache({ stdTTL: 60 * 60 * 5 }); // 5 hour TTL

function getS3Client(): S3Client {
  if (!s3) {
    const config = useRuntimeConfig()
    const key = config.spacesKey;
    const secret = config.spacesSecret;

    if (!key || !secret) {
      throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error: Missing S3 Credentials' });
    }
    s3 = new S3Client({
      forcePathStyle: false, // Default is false, explicitly set if needed
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: 'us-east-1', // Or appropriate region
      credentials: {
        accessKeyId: key,
        secretAccessKey: secret,
      },
    });
  }
  return s3;
}

function loadDevelopmentImages(): ImageInfo[] {
  try {
    const devImagesPath = path.resolve(process.cwd(), 'data', 'development-images.json5');
    const fileContent = fs.readFileSync(devImagesPath, 'utf-8');
    // Add basic validation or type assertion if needed
    return JSON5.parse(fileContent) as ImageInfo[];
  } catch (err) {
    console.error('Failed to load development-images.json5:', err);
    return []; // Return empty array if dev data fails
  }
}

async function listS3Images(): Promise<ImageInfo[]> {
  const client = getS3Client();
  const command = new ListObjectsCommand({ Bucket: 'elementary-iso' });

  try {
    const data = await client.send(command);
    if (!data.Contents) {
      return [];
    }
    return data.Contents
      .filter(obj => obj.Key && (obj.Key.endsWith('.iso') || obj.Key.endsWith('.img.xz')) && obj.LastModified && obj.Size != null)
      .map(obj => ({
        path: obj.Key!,
        timestamp: obj.LastModified!,
        size: obj.Size!,
      }));
  } catch (error) {
    console.error('Error listing objects from S3:', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to retrieve image list from storage.' });
  }
}

async function getImages(): Promise<ImageInfo[]> {
  const cacheKey = 'images';
  const cachedImages = cache.get<ImageInfo[]>(cacheKey);
  if (cachedImages) {
    console.log('Returning cached images data.');
    return cachedImages;
  }

  // Determine if S3 should be used:
  // - Always in production.
  // - In development, if SPACES_KEY and SPACES_SECRET are present.
  const s3KeysPresent = !!(spacesKey && spacesSecret); // spacesKey, spacesSecret are from module scope
  const shouldUseS3 = process.env.NODE_ENV === 'production' || s3KeysPresent;

  if (shouldUseS3) {
    try {
      console.log('Attempting to fetch images data from S3...');
      // getS3Client() will throw if keys are missing and S3 access is attempted.
      // listS3Images() will catch other S3 errors and re-throw them as createError.
      const images = await listS3Images();
      cache.set(cacheKey, images);
      console.log(`Fetched and cached ${images.length} images from S3.`);
      return images;
    } catch (s3Error: any) {
      // Log the S3 error
      console.error('S3 fetch failed:', s3Error.message || s3Error.statusMessage || s3Error);

      // If in production, this S3 failure is a hard error.
      // listS3Images or getS3Client should have already thrown an h3 error.
      // If for some reason it's not an h3 error, ensure one is thrown.
      if (process.env.NODE_ENV === 'production') {
        if (s3Error.statusCode) throw s3Error; // Re-throw if already an h3 error
        throw createError({ statusCode: 503, statusMessage: 'Failed to retrieve image list from S3 in production.', data: s3Error.message });
      }
      
      // In development, if S3 fails (e.g., keys present but invalid, network issue),
      // we will fall through to development data.
      console.warn('S3 fetch failed in development. Falling back to local development images data.');
    }
  }

  // Fallback for:
  // 1. Non-production environment AND S3 keys are NOT present.
  // 2. Non-production environment AND S3 keys ARE present BUT S3 fetch failed.
  if (process.env.NODE_ENV !== 'production') {
    console.log('Using local development images data (S3 not configured, S3 disabled for dev, or S3 fetch failed in dev).');
    const devImages = loadDevelopmentImages();
    // It's good practice to cache dev images too, to avoid frequent file reads.
    cache.set(cacheKey, devImages);
    return devImages;
  }
  
  // This point should ideally not be reached in production if S3 failed,
  // as an error should have been thrown. This is a safeguard.
  console.error('Critical: Image data source unavailable. No images could be loaded.');
  throw createError({ statusCode: 500, statusMessage: 'Image data source unavailable.' });
}

// --- Event Handler ---
export default defineEventHandler(async (event) => {
  try {
    const images = await getImages();
    return images;
  } catch (error: any) { // Catch potential errors from getImages (like S3 config errors)
    // Log the caught error for debugging
    console.error('Error in /api/images endpoint:', error);

    // If it's an error created by createError, re-throw it
    if (error.statusCode) {
      throw error;
    }
    // Otherwise, wrap it
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while fetching image data.',
      data: error.message
    });
  }
}); 