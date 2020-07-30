// This file is a copy from the nuxt auth module library, but configured to
// use a runtime secret variable.

const axios = require('axios')
const bodyParser = require('body-parser')

const formMiddleware = bodyParser.urlencoded({ extended: true })

export default function (req, res, next) {
  if (req.method !== 'POST') {
    return next()
  }

  formMiddleware(req, res, () => {
    const {
      code,
      redirect_uri: redirectUri,
      response_type: responseType,
      grant_type: grantType
    } = req.body

    if (!code) {
      return next()
    }

    axios
      .request({
        method: 'post',
        url: 'https://github.com/login/oauth/access_token',
        data: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          grant_type: grantType,
          response_type: responseType,
          redirect_uri: redirectUri,
          code
        },
        headers: {
          Accept: 'application/json'
        }
      })
      .then((response) => {
        res.end(JSON.stringify(response.data))
      })
      .catch(error => next(error))
  })
}
