/* eslint-disable import/first, import/named -- GraphQLClient causes an error of named import not found in tests, but does not actually do this when running as code. */
require('json5/lib/register')

import { serialize } from 'cookie'
import { GraphQLClient } from 'graphql-request'
import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'

const allowlist = require('../data/allowlist.json5')

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
    },
    fetch // Explicitly pass the fetch implementation
  })

  const query = `{
    viewer {
      login
      organizations(last: 100) {
        nodes {
          login
        }
      }
      sponsorshipsAsSponsor(last: 100) {
        nodes {
          tier {
            monthlyPriceInCents
          }
          sponsorable {
            ... on User {
              login
            }
            ... on Organization {
              login
            }
          }
        }
      }
    }
  }`

  return client.request(query)
    .catch((err) => {
      // If there are parts of the graph that this app does not have access to,
      // e.g. the user sponsoring another organization for which we cannot query
      // the "tier", GitHub will return partial "data" as well as some "errors".
      // graphql-request considers such a response an error, but we can salvage
      // the partial data by catching and inspecting the error:
      // https://github.com/prisma-labs/graphql-request/issues/5
      if (err.response && err.response.data) {
        return err.response.data
      } else {
        throw err
      }
    })
}

function isSponsored (data) {
  return data.viewer.sponsorshipsAsSponsor.nodes
    .filter(s => (s.sponsorable.login === 'elementary'))
    .map(s => s.tier.monthlyPriceInCents)
    .some(p => (p >= 100))
}

function isInOrganization (data) {
  return data.viewer.organizations.nodes
    .some(org => (org.login === 'elementary'))
}

function isAllowlisted (data) {
  return allowlist.users
    .map(u => u.toLowerCase())
    .includes(data.viewer.login.toLowerCase())
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
    const organizationed = isInOrganization(data)
    const allowListed = isAllowlisted(data)
    const success = (sponsored || organizationed || allowListed)

    if (!success) {
      throw new Error('Not sponsoring or allow listed')
    }

    const token = jwt.sign({
      access: true
    }, process.env.SIGNING_KEY, {
      expiresIn: 60 * 60 * 7
    })

    const cookie = serialize('builds', token, {
      path: '/',
      maxAge: 60 * 60 * 7
    })

    res.setHeader('set-cookie', cookie)
    res.end(JSON.stringify({ success: true }))
  } catch (err) {
    res.end(JSON.stringify({ success: false }))
  }
}
