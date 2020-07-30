#!/usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const xmlParser = require('fast-xml-parser')

const IMAGES_JSON_PATH = path.resolve(__dirname, '../data/images.json')

async function downloadManifest () {
  const res = await fetch('https://elementary-iso.nyc3.digitaloceanspaces.com')
  const body = await res.text()

  return xmlParser.parse(body)
}

function parseManifest (data) {
  return data.ListBucketResult.Contents
    .filter(({ Key }) => Key.endsWith('.iso'))
    .map(d => ({
      path: d.Key,
      timestamp: d.LastModified,
      size: d.Size
    }))
}

function writeJson (data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(IMAGES_JSON_PATH, JSON.stringify(data, null, 2), (err) => {
      if (err != null) {
        return reject(err)
      } else {
        return resolve()
      }
    })
  })
}

async function getImages () {
  const manifest = await downloadManifest()

  const data = parseManifest(manifest)

  await writeJson(data)
}

getImages()
