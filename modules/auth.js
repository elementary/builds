// This is a round about way of doing things. Normally you would just put this
// in your nuxt.config.js, but the auth module uses unshift to put it's
// middleware before everything else. This ensures we do the same thing back.

import serverMiddleware from '../server/auth'

export default function () {
  this.options.serverMiddleware.unshift({
    path: '/_auth/oauth/github/authorize',
    handler: serverMiddleware
  })
}
