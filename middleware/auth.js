export default function ({ redirect, store }) {
  if (!store.getters['auth/loggedIn']) {
    return redirect('/auth/login')
  }
}
