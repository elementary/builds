import AWS from 'aws-sdk'
import Cache from 'node-cache'

const developmentImages = require('../data/development-images')

const cache = new Cache({ stdTTL: 60 * 60 * 5 })

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com')
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET
})

async function downloadImages () {
  const manifest = await new Promise((resolve, reject) => {
    s3.listObjects({ Bucket: 'elementary-iso' }, (err, data) => {
      if (err != null) {
        return reject(err)
      } else {
        return resolve(data)
      }
    })
  })

  return manifest.Contents
    .filter(({ Key }) => Key.endsWith('.iso') || Key.endsWith('.img.xz'))
    .map(d => ({
      path: d.Key,
      timestamp: d.LastModified,
      size: d.Size
    }))
}

async function getImages () {
  if (process.env.NODE_ENV !== 'production') {
    return developmentImages
  }

  const cachedImages = cache.get('images')

  if (cachedImages != null) {
    return cachedImages
  } else {
    const images = await downloadImages()
    cache.set('images', images)
    return images
  }
}

export default async (req, res, next) => {
  const images = await getImages()
  res.end(JSON.stringify(images))
}
