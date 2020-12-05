export const state = () => ({
  images: []
})

export const getters = {
  imagesFor: (state, getters) => (channel = 'daily') => {
    return getters.images
      .filter(({ path }) => path.startsWith(`${channel}/`))
      .filter(({ path }) => path.includes('6.0'))
  },

  imagesOldForGroupedByDate: (state, getters) => (channel = 'daily') => {
    const result = []
    const map = {}
    const [, ...old] = getters.imagesFor(channel)
    old.forEach((image) => {
      const [, year, month, day] = image.path.match(/([0-9]{4})([0-9]{2})([0-9]{2})/)
      const key = `${year}-${month}`
      const date = new Date(`${year}-${month}-${day}T01:00:00.000Z`)
      if (!map[key]) {
        map[key] = {
          date: date.toLocaleDateString(undefined, {
            timeZone: 'UTC',
            year: 'numeric',
            month: 'short'
          }),
          images: []
        }
      }
      map[key].images.push(image)
    })
    for (const key in map) {
      result.push(map[key])
    }
    return result
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
