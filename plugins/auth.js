export default function ({ $auth, $config }) {
  $auth.strategies.github.options.client_id = $config.GITHUB_CLIENT_ID
  $auth.strategies.github.options.client_secret = $config.GITHUB_CLIENT_SECRET
}
