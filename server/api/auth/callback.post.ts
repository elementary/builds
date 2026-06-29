import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { GraphQLClient, gql } from 'graphql-request' // Import gql
import jwt from 'jsonwebtoken'
import { encodeParams } from '../../utils/url'
import { readDataAsset } from '../../utils/data'

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
    sponsorshipsAsSponsor?: {
      nodes: {
        paymentSource?: string | null;
        tier: {
          monthlyPriceInCents: number;
        } | null;
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

  const query = gql`{
    viewer {
      login
      organizations(last: 100) {
        nodes { login }
      }
      sponsorshipsAsSponsor(last: 100) {
        nodes {
          paymentSource
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
  } catch (error) {
    // Handle partial data error from graphql-request
    const e = error as { response?: { data?: unknown } };
    if (e.response?.data) {
      console.warn('GitHub GraphQL query returned partial data.');
      return e.response.data as GitHubUserData;
    }
    console.error('GitHub GraphQL request error:', error);
    throw createError({ statusCode: 502, statusMessage: 'GitHub Data Request Failed' });
  }
}

async function loadAllowlist(): Promise<Allowlist> {
  try {
    const data = await readDataAsset<Allowlist>('allowlist.json5');
    if (!data || !Array.isArray(data.users)) {
      console.error('Allowlist asset missing or malformed.');
      return { users: [] };
    }
    return data;
  } catch (err) {
    console.error('Failed to load or parse allowlist.json5:', err);
    // Depending on requirements, either throw or return an empty list
    // throw createError({ statusCode: 500, statusMessage: 'Server Config Error (Allowlist)' });
    return { users: [] }; // Default to empty if file is optional/missing
  }
}

// --- Authorization Check Functions (from original) ---
type SponsorshipNode = NonNullable<GitHubUserData['viewer']['sponsorshipsAsSponsor']>['nodes'][number];

function isSponsored(nodes: SponsorshipNode[]): boolean {
  return nodes
    .filter(s => s?.sponsorable && (s.sponsorable as { login?: string }).login === 'elementary')
    // Patreon-linked sponsorships have `tier: null`; guard to avoid TypeError.
    .map(s => s.tier && s.tier.monthlyPriceInCents)
    .some(p => p != null && p >= 100);
}

function isPatreon(nodes: SponsorshipNode[]): boolean {
  return nodes
    .filter(s => s?.sponsorable && (s.sponsorable as { login?: string }).login === 'elementary')
    .some(q => q.paymentSource === 'PATREON');
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
    const allowlist = await loadAllowlist();

    console.log('[API /auth/callback] Checking authorization...');
    // Users with no sponsorships may not have this field at all.
    const sponsorNodes = githubData?.viewer?.sponsorshipsAsSponsor?.nodes ?? [];
    const sponsored = isSponsored(sponsorNodes);
    const patreon = isPatreon(sponsorNodes);
    const organizationMember = isInOrganization(githubData);
    const allowListed = isAllowlisted(githubData, allowlist);
    const success = sponsored || patreon || organizationMember || allowListed;
    console.log(`[API /auth/callback] Auth check result - Sponsored: ${sponsored}, Patreon: ${patreon}, OrgMember: ${organizationMember}, Allowlisted: ${allowListed}, Overall: ${success}`);

    if (!success) {
      console.error(`[API /auth/callback] Auth denied for ${userLogin}.`, JSON.stringify(githubData, null, 2));
      return {
        success: false,
        reason: 'User does not meet authorization criteria.',
        debug: {
          login: userLogin,
          sponsored,
          patreon,
          organizationMember,
          allowListed,
          organizations: githubData?.viewer?.organizations?.nodes ?? [],
          sponsorships: sponsorNodes
        }
      };
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

  } catch (error) {
    console.error('[API /auth/callback] Error during processing:', error);
    if (error && typeof error === 'object' && 'statusCode' in error) { throw error; }
    const message = error instanceof Error ? error.message : String(error);
    throw createError({ statusCode: 500, statusMessage: 'Authentication failed due to an unexpected server error.', data: message });
  }
}); 