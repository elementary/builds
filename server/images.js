import { S3 } from '@aws-sdk/client-s3'
import Cache from 'node-cache'

const developmentImages = require('../data/development-images')

const cache = new Cache({ stdTTL: 60 * 60 * 5 })

const s3 = new S3({
  forcePathStyle: false,
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET
  }
})

async function downloadImages () {
  const allContents = []
  let marker = null

  do {
    const params = { Bucket: 'elementary-iso' }
    if (marker) {
      params.Marker = marker
    }

    const data = await s3.listObjects(params)
    allContents.push(...data.Contents)
    marker = data.IsTruncated
      ? data.Contents[data.Contents.length - 1].Key
      : null
  } while (marker)

  return allContents
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
