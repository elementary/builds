import { parse, serialize } from 'cookie'
import { jwtDecode } from 'jwt-decode'

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
    const { builds: cookieValue } = (this.app.context.req != null)
      ? parse(this.app.context.req.headers.cookie || '')
      : parse(document.cookie || '')

    const jwtToken = (cookieValue != null) ? jwtDecode(cookieValue) : {}

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
    window.document.cookie = serialize('builds', '', {
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
