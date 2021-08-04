export default {
  mode: 'universal',

  components: true,
  telemetry: true,

  head: {
    title: 'elementary Builds',

    htmlAttrs: {
      lang: 'en'
    },

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Early Access builds of elementary OS' }
    ],

    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    '~/assets/styles/main.scss'
  ],

  loading: {
    color: '#3689e6'
  },

  plugins: [
    '~/plugins/auth',
    '~/plugins/plausible'
  ],

  publicRuntimeConfig: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID
  },

  privateRuntimeConfig: {
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
  },

  serverMiddleware: {
    '/api/beta': '~/server/beta',
    '/api/download': '~/server/download',
    '/api/images': '~/server/images',
    '/auth/callback': '~/server/auth-callback',
    '/auth/login': '~/server/auth-url'
  }
}
