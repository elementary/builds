import whitelist from '~/data/whitelist'

export default function ({ $auth, error }) {
  if (!$auth.loggedIn) {
    return error({
      statusCode: 401,
      message: 'Not Logged In'
    })
  } else if (!whitelist.users.includes($auth.user.login)) {
    return error({
      statusCode: 403,
      message: 'Not Whitelisted'
    })
  }
}
