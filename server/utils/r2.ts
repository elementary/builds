import { S3Client } from '@aws-sdk/client-s3'
import { createError } from 'h3'
import type { Channel } from '../../utils/image-path'

interface R2Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  buckets: Record<Channel, string>;
}

let client: S3Client | null = null;
let clientFingerprint: string | null = null;

// Runtime config keys are flat (r2Endpoint, r2DailyBucket, …) so the
// NUXT_-prefixed environment overrides map onto them predictably in production.
function readConfig(): R2Config {
  const config = useRuntimeConfig() as unknown as Record<string, string | undefined>;

  const accountId = String(config.r2AccountId ?? '');
  const endpoint = String(config.r2Endpoint ?? '')
    || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

  return {
    endpoint,
    // R2 only accepts 'auto'; it stays overridable for other S3-compatible hosts.
    region: String(config.r2Region ?? '') || 'auto',
    accessKeyId: String(config.r2AccessKeyId ?? ''),
    secretAccessKey: String(config.r2SecretAccessKey ?? ''),
    buckets: {
      daily: String(config.r2DailyBucket ?? ''),
      stable: String(config.r2StableBucket ?? ''),
    },
  };
}

function missingConfig(channel: Channel): string[] {
  const { endpoint, accessKeyId, secretAccessKey, buckets } = readConfig();
  return [
    !endpoint && 'R2_ENDPOINT (or R2_ACCOUNT_ID)',
    !accessKeyId && 'R2_ACCESS_KEY_ID',
    !secretAccessKey && 'R2_SECRET_ACCESS_KEY',
    !buckets[channel] && `R2_${channel.toUpperCase()}_BUCKET`,
  ].filter((v): v is string => !!v);
}

function requireConfig(channel: Channel): R2Config {
  const missing = missingConfig(channel);
  if (missing.length) {
    console.error(`[r2] Missing ${channel} storage configuration: ${missing.join(', ')}`);
    throw createError({
      statusCode: 500,
      statusMessage: `Server Configuration Error: Missing ${missing.join(', ')}`
    });
  }
  return readConfig();
}

// True when a channel is configured; development falls back to sample data.
export function hasR2Config(channel: Channel): boolean {
  return missingConfig(channel).length === 0;
}

export function getBucket(channel: Channel): string {
  return requireConfig(channel).buckets[channel];
}

export function getR2Client(channel: Channel): S3Client {
  const { endpoint, region, accessKeyId, secretAccessKey } = requireConfig(channel);
  // Config can change inside production runtime, so cache the client against
  // a fingerprint based on the config it was built from.
  const fingerprint = `${endpoint}|${region}|${accessKeyId}`;
  if (client && clientFingerprint === fingerprint) {
    return client;
  }

  client = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  clientFingerprint = fingerprint;
  return client;
}
