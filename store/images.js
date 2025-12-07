export const state = () => ({
  images: []
})

export const getters = {
  imagesFor: (state, getters) => (channel = 'daily') => {
    return getters.images
      .filter(({ path }) => path.startsWith(`${channel}/`))
      .filter(({ path }) => path.includes('7.0') || path.includes('7.1') || path.includes('8.0') || path.includes('8.1'))
  },

  images (state) {
    return state.images
      .map(image => ({ ...image, timestamp: new Date(image.timestamp) }))
      .sort((a, b) => (b.timestamp - a.timestamp))
  }
}

export const mutations = {
  set (state, images) {
    state.images = images
  }
}

export const actions = {
  async fetch ({ commit, getters }) {
    if (getters.images.length < 1) {
      let url = '/api/images'

      const req = this.app.context.req
      if (req != null) {
        const protocol = (req.headers.host.startsWith('localhost')) ? 'http' : 'https'
        url = `${protocol}://${req.headers.host}${url}`
      }

      const res = await fetch(url, { method: 'GET' })
      const body = await res.json()

      commit('set', body)
    }

    return getters.images
  }
}
