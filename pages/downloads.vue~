<template>
  <div>
    <div class="large">
      <h2>Latest Build</h2>
      <p>Download <code>{{ latest(dailyIsos) | name }}</code>, which was built {{ latest(dailyIsos) | relativeDate }}. If this build does not install or otherwise work for you, try a previous build.</p>

      <div class="center">
        <a
          class="button"
          :href="latest(dailyIsos) | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latest(dailyIsos) | isoUrl"
        >
          Download ({{ latest(dailyIsos) | size }} GB)
        </a>
        </div>
    </div>

    <h2>Previous Builds</h2>
    <p>Historical daily builds may be useful for debugging issues, or when the latest build is not working for you.</p>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="iso in others(dailyIsos)"
          :key="iso.path"
        >
          <td>
            <a :href="iso | isoUrl">
              {{ iso | name }}
            </a>
          </td>

          <td>
            {{ iso | relativeDate }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
  hr {
    margin: 4rem 0;
  }

  table {
    background-color: var(--view-color);
    border-spacing: 0;
    border-radius: 0.375em;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.05),
      0 3px 6px rgba(0, 0, 0, 0.22);
    margin: 2em auto;
    max-width: 1000px;
    width: 100%;

    td,
    th {
      padding: 0.5em 1em;
      text-align: left;
    }

    td {
      border-top: 1px solid var(--dim-color);
    }

    th {
      background-color: var(--dim-color);
      opacity: 0.75;

      &:first-child {
        border-top-left-radius: calc(0.375em - 1px);
      }

      &:last-child {
        border-top-right-radius: calc(0.375em - 1px);
      }
    }
  }
</style>

<script>
import { formatRelative } from 'date-fns'

import images from '../data/images.json'

export default {
  middleware: (process.env.NODE_ENV === 'production')
    ? ['auth', 'allowed']
    : null,

  filters: {
    isoUrl (iso) {
      return `https://elementary-iso.nyc3.digitaloceanspaces.com/${iso.path}`
    },

    name (iso) {
      const [, name] = iso.path.split('/')

      return name
    },

    relativeDate (iso) {
      return formatRelative(iso.timestamp, new Date())
    },

    shaUrl (iso) {
      return `https://elementary-iso.nyc3.digitaloceanspaces.com/${iso.path}`
        .replace('.iso', '.sha256.txt')
    },

    size (iso) {
      return (iso.size / 1000000000).toFixed(2)
    }
  },

  computed: {
    images () {
      return images
        .map(image => ({ ...image, timestamp: new Date(image.timestamp) }))
        .sort((a, b) => (b.timestamp - a.timestamp))
    },

    dailyIsos () {
      return this.images
        .filter(({ path }) => path.startsWith('daily/'))
        .filter(({ path }) => path.includes('6.0'))
    },

    stableIsos () {
      return this.images
        .filter(({ path }) => path.startsWith('stable/'))
    }
  },

  methods: {
    latest (isos) {
      return isos[0]
    },

    others (isos) {
      const newIsos = [...isos]

      newIsos.shift()

      return newIsos
    }
  }
}
</script>
