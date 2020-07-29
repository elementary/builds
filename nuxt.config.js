export default {
  mode: 'universal',

  components: true,
  telemetry: true,

  build: {
    transpile: ['@nuxtjs/auth']
  },

  head: {
    title: 'elementary Builds',

    htmlAttrs: {
      lang: 'en'
    },

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Unstable and daily builds of elementary OS' }
    ],

    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  loading: {
    color: '#3689e6'
  },

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth'
  ],

  auth: {
    plugins: [
      '~/plugins/auth'
    ],

    strategies: {
      github: {}
    }
  },

  publicRuntimeConfig: {
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID
  },

  privateRuntimeConfig: {
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
  }
}
