function encodeParams (obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join('&')
}

export default (req, res, next) => {
  if (req.method !== 'POST') {
    return next()
  }

  const protocol = (req.headers.host.startsWith('localhost')) ? 'http' : 'https'
  const redirect = `${protocol}://${req.headers.host}/auth/callback`

  const params = encodeParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirect,
    scope: 'user,read:org'
  })

  res.end(JSON.stringify({
    url: `https://github.com/login/oauth/authorize?${params}`
  }))
}
