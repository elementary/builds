import Cookie from 'cookie'
import { GraphQLClient } from 'graphql-request'
import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'

import allowlist from '../data/allowlist'

function encodeParams (obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURI(value)}`)
    .join('&')
}

async function githubAccessToken (code) {
  const params = encodeParams({
    code,
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  })

  const res = await fetch(`https://github.com/login/oauth/access_token?${params}`, {
    method: 'POST',
    headers: {
      accept: 'application/json'
    }
  })

  return res.json()
}

function githubData (token) {
  const client = new GraphQLClient('https://api.github.com/graphql', {
    headers: {
      authorization: `bearer ${token}`
    }
  })

  const query = `{
    viewer {
      login
      sponsorshipsAsSponsor(last: 100) {
        nodes {
          tier {
            monthlyPriceInCents
          }
          maintainer {
            login
          }
        }
      }
    }
  }`

  return client.request(query)
}

function isSponsored (data) {
  return data.viewer.sponsorshipsAsSponsor.nodes
    .filter(s => (s.maintainer.login === 'elementary'))
    .map(s => s.tier)
    .map(t => t.monthlyPriceInCents)
    .some(p => (p >= 1000))
}

function isAllowlisted (data) {
  return allowlist.users.includes(data.viewer.login)
}

export default async (req, res, next) => {
  if (req.method !== 'POST') {
    return next()
  }

  const [key, code] = req._parsedUrl.search.split('=')

  if (key !== '?code') {
    return next()
  }

  try {
    const { access_token: accessToken } = await githubAccessToken(code)
    const data = await githubData(accessToken)

    const sponsored = isSponsored(data)
    const allowListed = isAllowlisted(data)
    const success = (sponsored || allowListed)

    if (!success) {
      throw new Error('Not sponsoring or allow listed')
    }

    const token = jwt.sign({
      access: true
    }, process.env.SIGNING_KEY, {
      expiresIn: 60 * 60 * 7
    })

    const cookie = Cookie.serialize('builds', token, {
      path: '/',
      maxAge: 60 * 60 * 7
    })

    res.setHeader('set-cookie', cookie)
    res.end(JSON.stringify({ success: true }))
  } catch (err) {
    res.end(JSON.stringify({ success: false }))
  }
}
