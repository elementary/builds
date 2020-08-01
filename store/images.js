export const state = () => ({
  images: []
})

export const getters = {
  dalies (state, getters) {
    return getters.images
      .filter(({ path }) => path.startsWith('daily/'))
      .filter(({ path }) => path.includes('6.0'))
  },

  latestDaily (state, getters) {
    const [latest] = getters.dalies
    return latest
  },

  images (state) {
    return state.images
      .map(image => ({ ...image, timestamp: new Date(image.timestamp) }))
      .sort((a, b) => (b.timestamp - a.timestamp))
  },

  oldDalies (state, getters) {
    const [, ...old] = getters.dalies
    return old
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
