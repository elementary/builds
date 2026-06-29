import { defineEventHandler, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

interface BuildsTokenPayload {
  access?: boolean;
  user?: { login?: string };
}

// Authoritative auth check: verifies the signature of the httpOnly 'builds'
// cookie server-side. The client cannot read or verify this cookie itself, so
// the route middleware calls here on every protected navigation rather than
// trusting client-side store state.
export default defineEventHandler((event) => {
  const signingKey = useRuntimeConfig().signingKey;
  if (!signingKey) {
    // A missing signing key is a fatal server misconfiguration, not an
    // unauthenticated user — fail loudly instead of silently denying everyone.
    console.error('[API /auth/status] Missing SIGNING_KEY in runtime config.');
    throw createError({ statusCode: 500, statusMessage: 'Server Configuration Error (Signing Key)' });
  }

  const token = getCookie(event, 'builds');
  if (!token) {
    return { authenticated: false };
  }

  try {
    const decoded = jwt.verify(token, signingKey) as BuildsTokenPayload;
    if (decoded?.access !== true) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      user: decoded.user?.login ? { login: decoded.user.login } : null
    };
  } catch {
    return { authenticated: false };
  }
});
