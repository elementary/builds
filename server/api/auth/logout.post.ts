import { defineEventHandler, setCookie } from 'h3'

export default defineEventHandler((event) => {
  // The 'builds' cookie is httpOnly, so it can only be cleared server-side.
  // Match the attributes used when setting it in callback.post.ts so the
  // browser reliably replaces and expires the existing cookie.
  setCookie(event, 'builds', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return { success: true }
})
