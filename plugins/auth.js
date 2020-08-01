export default function ({ store }) {
  if (process.client) {
    store.commit('auth/check')
  }
}
