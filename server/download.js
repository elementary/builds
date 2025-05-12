import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

const s3 = new S3({
  forcePathStyle: false,
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
})

function hasAuthentication (req) {
  const { builds: cookieValue } = parse(req.headers.cookie || '')

  try {
    const decoded = jwt.verify(cookieValue, process.env.SIGNING_KEY)
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

    location = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: 'elementary-iso',
      Key: downloadPath
    }), {
      expiresIn: 60 * 60
    })
  }

  res.writeHead(301, { location })
  return res.end()
}
