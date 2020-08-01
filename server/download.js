import AWS from 'aws-sdk'
import Cookie from 'cookie'
import jwt from 'jsonwebtoken'

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com')
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
})

function hasAuthentication (req) {
  const { builds: cookie } = Cookie.parse(req.headers.cookie || '')

  try {
    const decoded = jwt.verify(cookie, process.env.SIGNING_KEY)
    return decoded.access || false
  } catch (err) {
    return false
  }
}

export default async (req, res, next) => {
  const downloadPath = req.originalUrl.replace('/api/download/', '')
  let location = ''

  if (process.env.NODE_ENV !== 'production') {
    location = `https://elementary-iso.nyc3.digitaloceanspaces.com/${downloadPath}`
  } else {
    if (!hasAuthentication(req)) {
      res.writeHead(401)
      return res.end('Unauthorized')
    }

    location = await s3.getSignedUrl('getObject', {
      Bucket: 'elementary-iso',
      Key: downloadPath,
      Expires: 60 * 60
    })
  }

  res.writeHead(301, { location })
  return res.end()
}
