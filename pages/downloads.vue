<template>
  <div>
    <h1>elementary OS Daily Builds</h1>

    <disclaimer />

    <h2>Latest Build</h2>

    <template v-if="latestDaily">
      <p>
        Download <code>{{ latestDaily | name }}</code>, which was built {{
          latestDaily | relativeDate }}. If this build does not install or
        otherwise work for you, try a previous build.
      </p>
      <p>As this is a <strong>pre-release</strong> build, we ask that you refrain from sharing “reviews” or other in-depth looks at elementary OS in this state. Daily builds are intended for developers and dedicated testers, but it is best to maintain a sense of surprise for end users with the stable release.</p>

      <div class="center">
        <a
          class="button"
          :href="latestDaily | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestDaily | isoUrl"
        >
          Download ({{ latestDaily | size }} GB)
        </a>
      </div>
    </template>

    <template v-if="oldDalies.length > 0">
      <h2>Previous Builds</h2>
      <p>
        Historical daily builds may be useful for debugging issues, or when the
        latest build is not working for you.
      </p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="iso in oldDalies"
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
    </template>
  </div>
</template>

<style scoped lang="scss">
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
import { mapGetters } from 'vuex'

export default {
  middleware: (process.env.NODE_ENV === 'production')
    ? 'auth'
    : null,

  filters: {
    isoUrl (iso) {
      return `/api/download/${iso.path}`
    },

    name (iso) {
      const [, name] = iso.path.split('/')
      return name
    },

    relativeDate (iso) {
      const [, year, month, day] = iso.path.match(/([0-9]{4})([0-9]{2})([0-9]{2})/)
      const date = new Date(`${year}-${month}-${day}T01:00:00.000Z`)
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    shaUrl (iso) {
      return `/api/download/${iso.path}`
        .replace('.iso', '.sha256.txt')
    },

    size (iso) {
      return (iso.size / 1000000000).toFixed(2)
    }
  },

  async fetch () {
    await this.$store.dispatch('images/fetch')
  },

  computed: {
    ...mapGetters('images', ['latestDaily', 'oldDalies'])
  }
}
</script>
