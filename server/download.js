import AWS from 'aws-sdk'

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com')
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
})

function getUrl (Key) {
  if (process.env.NODE_ENV === 'production') {
    return s3.getSignedUrl('getObject', {
      Bucket: 'elementary-iso',
      Key,
      Expires: 60 * 60
    })
  } else {
    return `https://elementary-iso.nyc3.digitaloceanspaces.com/${Key}`
  }
}

export default async (req, res, next) => {
  const downloadPath = req.originalUrl.replace('/api/download/', '')
  const location = getUrl(downloadPath)

  res.writeHead(301, { location })
  res.end()
}
