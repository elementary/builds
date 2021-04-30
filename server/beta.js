import path from 'path'
import { Reader } from '@maxmind/geoip2-node'

const FILENAME = 'elementaryos-6.0-daily.20210430.iso'

function randomFromArray (...list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function getRegion (ip) {
  if (ip == null) {
    return randomFromArray('nyc3', 'sfo1')
  }

  const dbPath = path.join(__dirname, '/../data/GeoLite2-City.mmdb')
  const reader = await Reader.open(dbPath, {})
  const details = reader.city(ip)

  if (details == null || details.continent == null || details.continent.code == null || details.country == null || details.country.isoCode == null || details.location == null || details.location.longitude == null) {
    return randomFromArray('nyc3', 'sfo1')
  }

  const continent = details.continent.code
  const country = details.country.isoCode
  const longitude = details.location.longitude

  switch (continent) {
    case 'NA': {
      // These lists are based on who is on what side of the USA.
      const northEast = ['BZ', 'CR', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA']
      const northWest = ['AG', 'BS', 'BB', 'BM', 'VG', 'KY', 'CU', 'DM', 'DO', 'GL', 'GD', 'GP', 'HT', 'JM', 'MQ', 'MS', 'CW', 'AW', 'SX', 'BQ', 'PR', 'BL', 'KN', 'AI', 'LC', 'MF', 'PM', 'VC', 'TT', 'TC', 'VI']

      if (northEast.includes(country) || longitude < -100) {
        return 'sfo1'
      } else if (northWest.includes(country) || longitude >= -100) {
        return 'nyc3'
      } else {
        return randomFromArray('nyc3', 'sfo1')
      }
    }

    case 'EU': {
      // These lists are based on who is connected to which international exchange directly.
      // They are by no means exclusive.
      const isles = ['GB', 'IM', 'IE', 'FO', 'IS', 'GG', 'JE', 'GI']
      const vikings = ['NL', 'SX', 'DK', 'NO', 'SE', 'FI', 'SJ']

      // Great Britain
      if (isles.includes(country)) {
        return 'ams3'
      // Vikings
      } else if (vikings.includes(country)) {
        return 'ams3'
      // Everywhere else
      } else {
        return randomFromArray('ams3', 'fra1')
      }
    }

    case 'SA': {
      return randomFromArray('nyc3', 'sfo1')
    }

    case 'AF': {
      return randomFromArray('fra1', 'ams3')
    }

    case 'AS':
    case 'OC':
    case 'AN': {
      return 'sgp1'
    }

    default: {
      return randomFromArray('nyc3', 'ams3')
    }
  }
}

export default async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const region = await getRegion(ip)

  const timestamp = (Date.now() / 1000).toFixed()
  const timecode = Buffer.from(timestamp).toString('base64')

  const location = `//${region}.dl.elementary.io/download/${timecode}/${FILENAME}`

  res.writeHead(301, { location })
  return res.end()
}
