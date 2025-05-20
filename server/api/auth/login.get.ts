import { defineEventHandler, getRequestHost, getRequestProtocol, createError } from 'h3'


export default defineEventHandler(async (event) => {
  console.log('[API /auth/login] Request received.');
  // Access runtime config using the composable
  const config = useRuntimeConfig(event) // Pass event for server routes
  const clientId = config.public.githubClientId // Access using the key defined in nuxt.config

  // Basic check if the config value is set
  if (!clientId) {
    console.error('[API /auth/login] Missing githubClientId in public runtime config.');
    // Use createError for proper error handling in h3
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: Missing GitHub Client ID'
    })
  }

  // Get protocol and host from the request event in Nuxt 3
  const protocol = getRequestProtocol(event, { xForwardedProto: true })
  const host = getRequestHost(event, { xForwardedHost: true })
  const redirect = `${protocol}://${host}/auth/callback`
  console.log(`[API /auth/login] Determined redirect URI: ${redirect}`);

  const params = encodeParams({
    client_id: clientId, // Use correct variable
    redirect_uri: redirect,
    scope: 'read:user,read:org' // Consider making scope configurable if needed
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params}`;
  console.log(`[API /auth/login] Generated auth URL: ${authUrl}`);

  return {
    url: authUrl
  }
  // h3 automatically stringifies the return object and sets Content-Type to application/json
}) 