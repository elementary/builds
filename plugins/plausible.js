export default (context, inject) => {
  if (process.env.NODE_ENV === 'production') {
    context.app.head.script.push({
      src: 'https://stats.elementary.io/js/index.js',
      'data-domain': 'builds.elementary.io',
      async: true,
      defer: true
    })
  }

  context.app.head.script.push({
    innerHTML: `
      window.plausible = window.plausible || function() {
        (window.plausible.q = window.plausible.q || []).push(arguments)
      }
    `
  })

  inject('plausible', (...args) => {
    if (global.window != null) {
      window.plausible(...args)
    }
  })
}
