import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true }, // Enable Nuxt DevTools
  compatibilityDate: '2025-05-12',

  modules: [
    '@pinia/nuxt',
    // Plausible only loads in production; dev pageviews would pollute analytics
    // and the script path matches common tracker blocklists, hanging the dev client.
    ...(process.env.NODE_ENV === 'production' ? ['@nuxtjs/plausible'] : []),
  ],

  css: [
    '~/assets/styles/main.scss'
  ],

  app: {
    head: {
      title: 'elementary Builds',
      htmlAttrs: {
        lang: 'en'
      },
      // charset and viewport are provided by Nuxt's defaults.
      meta: [
        { name: 'description', content: 'Early Access builds of elementary OS' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Nuxt 3 serves static assets from `public/` by default; this repo keeps them
  // in `static/` (favicon.ico, elementary.svg), so point the public dir at it.
  dir: {
    public: 'static'
  },

  runtimeConfig: {
    // Private keys are only available server-side
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    signingKey: process.env.SIGNING_KEY,
    spacesKey: process.env.SPACES_KEY,
    spacesSecret: process.env.SPACES_SECRET,
    // Public keys that are exposed to the client
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID
    }
  },

  plausible: {
    // Required: Specify the domain registered with Plausible
    domain: 'builds.elementary.io',
    // Optional: Specify the Plausible API host (if self-hosting or using custom domain)
    //apiHost: 'https://stats.elementary.io',
    // Optional: Auto-track outbound links
    //autoOutboundTracking: true,
  },
}) 