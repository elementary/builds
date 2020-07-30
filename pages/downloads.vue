<template>
  <div class="center">
    <h1>Daily ISOs</h1>

    <div class="large">
      <h2>{{ latest(dailyIsos) | name }}</h2>
      <h3>Built {{ latest(dailyIsos) | relativeDate }}</h3>

      <a
        class="download"
        :href="latest(dailyIsos) | isoUrl"
      >
        Download
      </a>

      <h5>
        {{ latest(dailyIsos) | size }} GB |
        <a :href="latest(dailyIsos) | shaUrl">
          Download SHA
        </a>
      </h5>
    </div>

    <hr>

    <h2>Previous ISOs</h2>

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
  .large h3 {
    margin-top: 1em;
  }

  .large .download {
    appearance: none;
    background-color: var(--grape-700);
    border-color: transparent;
    border-radius: 3px;
    border: none;
    color: #fff;
    display: inline-block;
    font-family: inherit;
    font-family: var(--ui-font);
    font-size: 16px;
    font-weight: 600;
    margin: 24px 24px 12px;
    min-width: 250px;
    outline: none;
    padding: 7px;
    text-align: center;
    text-decoration: none;
    text-rendering: optimizeLegibility;
    transition: opacity 200ms ease;
  }

  .large .download:hover,
  .large .download:focus,
  .large .download:active {
    background-color: var(--grape-500);
    box-shadow:
      0 2px 3px -1px rgba(73, 55, 147, 0.3),
      0 5px 10px -2px rgba(156, 100, 218, 0.5);
    opacity: 0.8;
  }

  .large h5 {
    margin-top: 0;
  }

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
    ? ['auth', 'whitelisted']
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
