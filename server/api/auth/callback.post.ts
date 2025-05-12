import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import Cookie from 'cookie'
import { GraphQLClient, gql } from 'graphql-request' // Import gql
import jwt from 'jsonwebtoken'
import JSON5 from 'json5' // Use standard import for json5
import fs from 'node:fs' // For reading the allowlist file
import path from 'node:path' // For resolving the allowlist path

// --- Types (improve maintainability) ---
interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubUserData {
  viewer: {
    login: string;
    organizations: {
      nodes: { login: string }[];
    };
    sponsorshipsAsSponsor: {
      nodes: {
        tier: {
          monthlyPriceInCents: number;
        };
        sponsorable: {
          login: string;
        };
      }[];
    };
  };
}

interface Allowlist {
  users: string[];
}

// --- Helper Functions (from original, slightly adapted) ---
function encodeParams(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
}

async function getGithubAccessToken(code: string): Promise<string> {
  // Use runtime config
  const config = useRuntimeConfig()
  const clientId = config.public.githubClientId;
  const clientSecret = config.githubClientSecret; // Access server-only config (no .public)

  if (!clientId || !clientSecret) {
    console.error('Missing GitHub client ID or secret in runtime config');
    throw createError({ statusCode: 500, statusMessage: 'Server Auth Config Error' });
  }

  const params = encodeParams({
    code,
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(`https://github.com/login/oauth/access_token?${params}`, {
    method: 'POST',
    headers: { accept: 'application/json' }
  });

  if (!response.ok) {
    console.error('GitHub token request failed:', response.status);
    throw createError({ statusCode: 502, statusMessage: 'GitHub Token Request Failed' });
  }

  const data = await response.json() as GitHubTokenResponse;

  if (data.error || !data.access_token) {
    console.error('GitHub token response error:', data.error_description || 'No token');
    throw createError({ statusCode: 400, statusMessage: data.error_description || 'GitHub Auth Error' });
  }

  return data.access_token;
}

async function getGithubData(token: string): Promise<GitHubUserData> {
  const client = new GraphQLClient('https://api.github.com/graphql', {
    headers: { authorization: `bearer ${token}` }
  });

  // Use gql tag for syntax highlighting and potential future benefits
  const query = gql`{
    viewer {
      login
      organizations(last: 100) {
        nodes { login }
      }
      sponsorshipsAsSponsor(last: 100) {
        nodes {
          tier { monthlyPriceInCents }
          sponsorable { 
            __typename # Good to fetch the type for debugging or conditional logic
            ... on User { login }
            ... on Organization { login }
          }
        }
      }
    }
  }`;

  try {
    // Type the expected response
    return await client.request<GitHubUserData>(query);
  } catch (error: any) {
    // Handle partial data error from graphql-request
    if (error.response && error.response.data) {
      console.warn('GitHub GraphQL query returned partial data.');
      return error.response.data as GitHubUserData;
    }
    console.error('GitHub GraphQL request error:', error);
    throw createError({ statusCode: 502, statusMessage: 'GitHub Data Request Failed' });
  }
}

function loadAllowlist(): Allowlist {
  try {
    // Resolve path relative to the current file (__dirname is not available in ESM)
    // Assuming server/api/auth/callback.post.ts
    const allowlistPath = path.resolve(process.cwd(), 'data', 'allowlist.json5');
    const fileContent = fs.readFileSync(allowlistPath, 'utf-8');
    return JSON5.parse(fileContent);
  } catch (err) {
    console.error('Failed to load or parse allowlist.json5:', err);
    // Depending on requirements, either throw or return an empty list
    // throw createError({ statusCode: 500, statusMessage: 'Server Config Error (Allowlist)' });
    return { users: [] }; // Default to empty if file is optional/missing
  }
}

// --- Authorization Check Functions (from original) ---
function isSponsored(data: GitHubUserData): boolean {
  if (!data?.viewer?.sponsorshipsAsSponsor?.nodes) return false;
  return data.viewer.sponsorshipsAsSponsor.nodes
    .filter(s => {
      // Check if sponsorable and tier exist
      if (!s?.sponsorable || !s?.tier) return false;
      // Check the sponsorable's login (User or Organization)
      const sponsorableLogin = (s.sponsorable as { login?: string }).login;
      return sponsorableLogin === 'elementary' && s.tier.monthlyPriceInCents >= 100;
    })
    .length > 0; // Simpler check than map and some
}

function isInOrganization(data: GitHubUserData): boolean {
  if (!data?.viewer?.organizations?.nodes) return false;
  return data.viewer.organizations.nodes
    .some(org => org?.login === 'elementary');
}

function isAllowlisted(data: GitHubUserData, allowlist: Allowlist): boolean {
  if (!data?.viewer?.login) return false;
  const lowerCaseLogin = data.viewer.login.toLowerCase();
  return allowlist.users
    .map(u => u.toLowerCase())
    .includes(lowerCaseLogin);
}

// --- Event Handler --- 
export default defineEventHandler(async (event) => {
  console.log('[API /auth/callback] Request received.');
  const body = await readBody(event);
  const code = body?.code as string | undefined;
  console.log(`[API /auth/callback] Received code: ${code ? '***' : 'Missing'}`);

  if (!code) {
    console.error('[API /auth/callback] Code missing in request body.');
    throw createError({ statusCode: 400, statusMessage: 'Missing authorization code' });
  }

  const config = useRuntimeConfig()
  const signingKey = config.signingKey;
  if (!signingKey) {
    console.error('[API /auth/callback] Missing SIGNING_KEY in runtime config.');
    throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error (Signing Key)' });
  }

  try {
    console.log('[API /auth/callback] Getting GitHub access token...');
    const accessToken = await getGithubAccessToken(code);
    console.log('[API /auth/callback] Got GitHub access token.');

    console.log('[API /auth/callback] Getting GitHub user data...');
    const githubData = await getGithubData(accessToken);
    const userLogin = githubData?.viewer?.login || 'unknown';
    console.log(`[API /auth/callback] Got GitHub data for user: ${userLogin}`);

    console.log('[API /auth/callback] Loading allowlist...');
    const allowlist = loadAllowlist();

    console.log('[API /auth/callback] Checking authorization...');
    const sponsored = isSponsored(githubData);
    const organizationMember = isInOrganization(githubData);
    const allowListed = isAllowlisted(githubData, allowlist);
    const success = sponsored || organizationMember || allowListed;
    console.log(`[API /auth/callback] Auth check result - Sponsored: ${sponsored}, OrgMember: ${organizationMember}, Allowlisted: ${allowListed}, Overall: ${success}`);

    if (!success) {
      console.log(`[API /auth/callback] Auth denied for ${userLogin}. Returning failure.`);
      // Return failure, client will handle redirect
      return { success: false, reason: 'User does not meet authorization criteria.' };
    }

    console.log(`[API /auth/callback] Auth success for ${userLogin}. Creating JWT...`);
    const token = jwt.sign(
      { access: true, user: { login: userLogin } },
      signingKey,
      { expiresIn: '7h' }
    );

    console.log(`[API /auth/callback] Setting cookie 'builds'...`);
    setCookie(event, 'builds', token, {
        path: '/',
        maxAge: 60 * 60 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    console.log(`[API /auth/callback] Cookie set. Returning success to client.`);
    // Return success, client will handle redirect
    // Include user details for the store
    return { success: true, user: { login: userLogin, name: userLogin } }; 

  } catch (error: any) {
    console.error('[API /auth/callback] Error during processing:', error);
    if (error.statusCode) { throw error; }
    throw createError({ statusCode: 500, statusMessage: 'Authentication failed due to an unexpected server error.', data: error.message });
  }
}); 