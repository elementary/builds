const fs = require('fs')
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios')
const parser = require('fast-xml-parser')

// return uniques
const unique = (v, i, a) => a.indexOf(v) === i

const getIsos = async () => {
  try {
    const res = await axios.get('https://elementary-iso.nyc3.digitaloceanspaces.com')
    const obj = parser.parse(res.data)
    const pathKeys = obj.ListBucketResult.Contents.map(entry => entry.Key)
    // get all daily and stable keys
    const allDaily = pathKeys.filter(url => url.includes('daily/')).map(u => u.slice(6))
    const allStable = pathKeys.filter(url => url.includes('stable/')).map(u => u.slice(7))
    // get just the unique names
    const regex = /(.iso(.*))|(.md5.txt)|(.sha256.txt)/
    const releases = {
      daily: allDaily.map(v => v.replace(regex, '')).filter(unique).reverse(),
      stable: allStable.map(v => v.replace(regex, '')).filter(unique).reverse()
    }
    return fs.writeFile('data/images.json', JSON.stringify(releases, null, 2), (err) => {
      if (err) { throw err }
      console.log('Updated image list')
    })
  } catch (err) {
    console.log('Unable to get images:', err)
    return err
  }
}

getIsos()
