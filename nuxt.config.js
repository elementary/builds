
export default {
  mode: 'universal',
  // Headers of the page
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ],
  },
  // Customize the progress-bar color
  loading: { color: '#fff' },
  // Global CSS
  css: [
  ],
  // Plugins to load before mounting the App
  plugins: [
  ],
  // Nuxt.js dev-modules
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
  ],
  // Nuxt.js modules
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/proxy',
  ],
  proxy: {
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  auth: {
    strategies: {
      github: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
    },
  },
  router: {
    middleware: ['auth'],
  },
  // Build configuration
  build: {
    //  You can extend webpack config here
    // eslint-disable-next-line no-unused-vars
    extend(config, ctx) {
    },
  },
};
