import { defineEventHandler, getCookie } from 'h3'
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
  const token = getCookie(event, 'builds');
  const signingKey = useRuntimeConfig().signingKey;

  if (!token || !signingKey) {
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
