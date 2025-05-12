import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { defineEventHandler, getCookie, sendRedirect, createError, getRouterParam } from 'h3'
import jwt from 'jsonwebtoken'

// Config now accessed via useRuntimeConfig() below

let s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3) {
    const config = useRuntimeConfig(); // Use auto-available composable
    const key = config.spacesKey;
    const secret = config.spacesSecret;
    if (!key || !secret) {
      console.error('Missing S3 credentials in runtime config');
      throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error: Missing S3 Credentials' });
    }
    s3 = new S3Client({
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: 'us-east-1',
      credentials: { accessKeyId: key, secretAccessKey: secret },
    });
  }
  return s3;
}

// --- Authentication Helper (Consider moving to a shared server util) ---
function isAuthenticated(event: any): boolean {
  const token = getCookie(event, 'builds');
  const config = useRuntimeConfig(); // Use auto-available composable
  const key = config.signingKey;

  if (!token || !key) {
    console.warn('Download auth check failed: Missing token or signing key in runtime config');
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
  // Get the download path from the dynamic route parameter `slug`
  // `event.context.params.slug` should contain the matched path segments
  const downloadPath = getRouterParam(event, 'slug');

  if (!downloadPath) {
    throw createError({ statusCode: 400, statusMessage: 'Missing download path' });
  }

  let redirectUrl = '';

  // Config access within handler if needed (example)
  // const config = useRuntimeConfig(); 

  // --- Development Environment --- 
  if (process.env.NODE_ENV !== 'production') {
    console.log(`DEV MODE: Redirecting directly to S3 for ${downloadPath}`);
    redirectUrl = `https://elementary-iso.nyc3.digitaloceanspaces.com/${downloadPath}`;
  }
  // --- Production Environment --- 
  else {
    if (!isAuthenticated(event)) {
      console.warn(`Unauthorized download attempt for: ${downloadPath}`);
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Access token is missing or invalid.' });
    }

    // User is authenticated, generate presigned URL
    try {
      const client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: 'elementary-iso',
        Key: downloadPath,
        // ResponseContentType: 'application/octet-stream' // Optional: Suggest download
      });

      redirectUrl = await getSignedUrl(client, command, {
        expiresIn: 60 * 60, // 1 hour
      });
      console.log(`Generated presigned URL for: ${downloadPath}`);
    } catch (error: any) {
      console.error(`Error generating presigned URL for ${downloadPath}:`, error);
      // Handle specific S3 errors like NoSuchKey?
      if (error.name === 'NoSuchKey') {
           throw createError({ statusCode: 404, statusMessage: 'File not found.' });
      }
      throw createError({ statusCode: 500, statusMessage: 'Failed to generate download link.' });
    }
  }

  // Perform the redirect
  await sendRedirect(event, redirectUrl, 302); // Use 302 Found for temporary redirect
}); 