import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { defineEventHandler, getCookie, sendRedirect, createError, getRouterParam, type H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { getBucket, getR2Client } from '../../utils/r2'
import { channelForKey } from '../../../utils/image-path'

// --- Authentication Helper (Consider moving to a shared server util) ---
function isAuthenticated(event: H3Event): boolean {
  const key = useRuntimeConfig().signingKey;
  if (!key) {
    // A missing signing key is a fatal server misconfiguration, not an
    // unauthenticated request — fail loudly rather than 401-ing everyone.
    console.error('Download auth check: Missing SIGNING_KEY in runtime config.');
    throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error (Signing Key)' });
  }

  const token = getCookie(event, 'builds');
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, key) as { access?: boolean };
    return decoded?.access === true;
  } catch (err) {
    console.warn('Download auth check failed: Invalid token', err);
    return false;
  }
}

// --- Event Handler ---
export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'slug');

  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing download path' });
  }

  const segments = key.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid download path' });
  }

  const channel = channelForKey(key);
  if (!channel) {
    throw createError({ statusCode: 404, statusMessage: 'File not found.' });
  }

  if (process.env.NODE_ENV === 'production' && !isAuthenticated(event)) {
    console.warn(`Unauthorized download attempt for: ${key}`);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Access token is missing or invalid.' });
  }

  let redirectUrl: string;
  try {
    const client = getR2Client(channel);
    const command = new GetObjectCommand({
      Bucket: getBucket(channel),
      Key: key,
      // ResponseContentType: 'application/octet-stream' // Optional: Suggest download
    });

    redirectUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 60, // 1 hour
    });
    console.log(`Generated presigned URL for: ${key}`);
  } catch (error) {
    console.error(`Error generating presigned URL for ${key}:`, error);
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error; // Configuration errors already carry a status.
    }
    if (error instanceof Error && error.name === 'NoSuchKey') {
      throw createError({ statusCode: 404, statusMessage: 'File not found.' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate download link.' });
  }

  // Perform the redirect
  await sendRedirect(event, redirectUrl, 302); // Use 302 Found for temporary redirect
});
