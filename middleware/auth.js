export default function ({ redirect, store }) {
  if (!store.getters['auth/loggedIn']) {
    store.commit('auth/check')
  }

  if (!store.getters['auth/loggedIn']) {
    return redirect('/auth/login')
  }
}
