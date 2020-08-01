import Cookie from 'cookie'
import jwtDecode from 'jwt-decode'

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    const cookies = req.headers.cookie || ''
    const { builds: cookie } = Cookie.parse(cookies)
    const token = (cookie != null) ? jwtDecode(cookie) : {}

    if (token.exp) {
      commit('auth/set', token)
    }
  }
}
