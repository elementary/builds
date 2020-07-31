import allowlist from '~/data/allowlist'

export default function ({ $auth, error }) {
  if (!$auth.loggedIn) {
    return error({
      statusCode: 401,
      message: 'Not Logged In'
    })
  } else if (!allowlist.users.includes($auth.user.login)) {
    return error({
      statusCode: 403,
      message: 'GitHub Account Not Allowed'
    })
  }
}
