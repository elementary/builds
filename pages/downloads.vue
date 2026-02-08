<template>
  <div>
    <h2>Stable (RC) Builds</h2>
    <p>
      These releases are built with the stable repos and are considered release
      candidate (RC) quality. Configuration changes may occur between one build
      and the next, but generally they should be safe to use.
    </p>

    <template v-if="latestStable">
      <h3>64-bit AMD/Intel</h3>
      <p>
        <code>{{ latestStable | name }}</code> was built {{
          latestStable | relativeDate }}.
      </p>

      <div class="center">
        <a
          class="button"
          :href="latestStable | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestStable | isoUrl"
        >
          Download ({{ latestStable | size }} GB)
        </a>
      </div>
    </template>

    <template v-if="latestStableArm64">
      <h3>64-bit Native ARM</h3>
      <p>
        <code>{{ latestStableArm64 | name }}</code> was built {{
          latestStableArm64 | relativeDate }}.
      </p>

      <div class="center">
        <a
          class="button"
          :href="latestStableArm64 | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestStableArm64 | isoUrl"
        >
          Download ({{ latestStableArm64 | size }} GB)
        </a>
      </div>
    </template>

    <h2>Daily Builds</h2>

    <disclaimer-text />

    <template v-if="latestDaily">
      <h3>64-bit AMD/Intel</h3>
      <p>
        <code>{{ latestDaily | name }}</code> was built {{
          latestDaily | relativeDate }}. If it does not install or
        otherwise work for you, try a <a href="#oldDailies">previous build</a>.
      </p>

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

    <template v-if="latestDailyArm64">
      <h3>64-bit Native ARM</h3>
      <p>
        <strong>Experimental build</strong>
      </p>
      <p>
        <code>{{ latestDailyArm64 | name }}</code> was built {{
          latestDailyArm64 | relativeDate }}. If it does not install or
        otherwise work for you, try a <a href="#oldDailiesArm64">previous build</a>.
      </p>

      <div class="center">
        <a
          class="button"
          :href="latestDailyArm64 | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestDailyArm64 | isoUrl"
        >
          Download ({{ latestDailyArm64 | size }} GB)
        </a>
      </div>
    </template>

    <h2>Previous Daily Builds</h2>
    <p>
      Historical daily builds may be useful for debugging issues, or if the
      latest build is not working for you.
    </p>

    <template v-if="oldDailies.length > 0">
      <details>
        <summary>
          <h3 id="oldDailies">
            64-bit AMD/Intel
          </h3>
        </summary>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Checksum</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="iso in oldDailies"
              :key="iso.path"
            >
              <td>
                <a :href="iso | isoUrl">
                  {{ iso | name }}
                </a>
              </td>

              <td>
                <a :href="iso | shaUrl">
                  SHA256
                </a>
              </td>

              <td>
                {{ iso | relativeDate }}
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>

    <template v-if="oldDailiesArm64.length > 0">
      <details>
        <summary>
          <h3 id="oldDailiesArm64">
            64-bit Native ARM
          </h3>
        </summary>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Checksum</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="iso in oldDailiesArm64"
              :key="iso.path"
            >
              <td>
                <a :href="iso | isoUrl">
                  {{ iso | name }}
                </a>
              </td>

              <td>
                <a :href="iso | shaUrl">
                  SHA256
                </a>
              </td>

              <td>
                {{ iso | relativeDate }}
              </td>
            </tr>
          </tbody>
        </table>
      </details>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
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
        timeZone: 'UTC',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    shaUrl (iso) {
      return `/api/download/${iso.path}`
        .replace('.iso', '.sha256.txt')
        .replace('.img.xz', '.sha256.txt')
    },

    size (iso) {
      return (iso.size / 1000000000).toFixed(2)
    }
  },

  middleware: (process.env.NODE_ENV === 'production')
    ? 'auth'
    : null,

  async fetch () {
    await this.$store.dispatch('images/fetch')
  },

  computed: {
    ...mapGetters('images', ['imagesFor']),

    latestStable () {
      const [latest] = this.imagesFor('stable')
      return latest
    },

    latestStableArm64 () {
      const [latest] = this.imagesFor('stable-arm64')
      return latest
    },

    latestDaily () {
      const [latest] = this.imagesFor('daily')
      return latest
    },

    latestDailyArm64 () {
      const [latest] = this.imagesFor('daily-arm64')
      return latest
    },

    oldStables () {
      const [, ...old] = this.imagesFor('stable')
      return old
    },

    oldDailies () {
      const [, ...old] = this.imagesFor('daily')
      return old
    },

    oldDailiesArm64 () {
      const [, ...old] = this.imagesFor('daily-arm64')
      return old
    }
  }
}
</script>
