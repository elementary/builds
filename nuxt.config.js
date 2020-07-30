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
      { hid: 'description', name: 'description', content: 'Unstable and daily builds of elementary OS' }
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
  }
}
