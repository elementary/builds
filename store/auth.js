import Cookie from 'cookie'
import jwtDecode from 'jwt-decode'

export const state = () => ({
  expires: null
})

export const getters = {
  loggedIn: (state) => {
    if (state.expires == null) {
      return false
    } else {
      return new Date().getTime() > state.expires.getTime()
    }
  }
}

export const mutations = {
  check (state) {
    const { builds: cookie } = (this.app.context.req != null)
      ? Cookie.parse(this.app.context.req.headers.cookie || '')
      : Cookie.parse(document.cookie || '')

    const jwtToken = (cookie != null) ? jwtDecode(cookie) : {}

    if (jwtToken.exp) {
      state.expires = new Date(jwtToken.exp)
    }
  },

  set (state, token) {
    if (token.exp) {
      state.expires = new Date(token.exp)
    }
  },

  clear (state) {
    window.document.cookie = Cookie.serialize('builds', '', {
      path: '/',
      maxAge: 0
    })
    state.expires = null
  }
}

export const actions = {
  async authenticate ({ commit, getters }, { code }) {
    const res = await fetch(`/auth/callback?code=${encodeURI(code)}`, {
      method: 'POST'
    })

    const { success } = await res.json()

    if (success) {
      commit('check')
    }

    return getters.loggedIn
  },

  async loginUrl ({ commit, getters }) {
    const res = await fetch('/auth/login', { method: 'POST' })
    const { url } = await res.json()

    return url
  }
}
