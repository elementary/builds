<template>
  <div>
    <h1>elementary OS Early Access Builds</h1>

    <disclaimer />

    <h2>Latest Builds</h2>

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

    <template v-if="latestPinebook">
      <h3>Pinebook Pro</h3>
      <p>
        <strong>Experimental build</strong>; see
        <a href="https://github.com/elementary/os/wiki/Pinebook-Pro" target="_blank" rel="noopener">the wiki</a>
        for more info.
      </p>
      <p>
        <code>{{ latestPinebook | name }}</code> was built
        {{ latestPinebook | relativeDate }}. If it does not install or
        otherwise work for you, try a <a href="#oldPinebooks">previous build</a>.
      </p>

      <div class="center">
        <a
          class="button"
          :href="latestPinebook | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestPinebook | isoUrl"
        >
          Download ({{ latestPinebook | size }} GB)
        </a>
      </div>
    </template>

    <template v-if="latestRasPi">
      <h3>Raspberry Pi 4</h3>
      <p>
        <strong>Experimental build</strong>; see
        <a href="https://github.com/elementary/os/wiki/Raspberry-Pi" target="_blank" rel="noopener">the wiki</a>
        for more info.
      </p>
      <p>
        <code>{{ latestRasPi | name }}</code> was built
        {{ latestRasPi | relativeDate }}. If it does not install or
        otherwise work for you, try a <a href="#oldRasPis">previous build</a>.
      </p>

      <div class="center">
        <a
          class="button"
          :href="latestRasPi | shaUrl"
        >
          Download SHA256
        </a>
        <a
          class="button suggested"
          :href="latestRasPi | isoUrl"
        >
          Download ({{ latestRasPi | size }} GB)
        </a>
      </div>
    </template>

    <h2>Previous Builds</h2>
    <p>
      Historical daily builds may be useful for debugging issues, or if the
      latest build is not working for you.
    </p>

    <template v-if="oldDailies.length > 0">
      <h3 id="oldDailies">
        64-bit AMD/Intel
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Checksum</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="month in oldDailies"
          >
            <tr
              :key="month.date"
              :class="{ opened: opened.includes(`oldDailies-${month.date}`) }"
              @click="toggle(`oldDailies-${month.date}`)"
            >
              <td>{{ month.date }}</td>
              <td />
              <td style="text-align:right">
                <font-awesome-icon v-if="opened.includes(`oldDailies-${month.date}`)" :icon="faChevronUp" />
                <font-awesome-icon v-else :icon="faChevronDown" />
              </td>
            </tr>
            <template v-if="opened.includes(`oldDailies-${month.date}`)">
              <tr
                v-for="iso in month.images"
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
            </template>
          </template>
        </tbody>
      </table>
    </template>

    <template v-if="oldPinebooks.length > 0">
      <h3 id="oldPinebooks">
        Pinebook Pro
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Checksum</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="month in oldPinebooks"
          >
            <tr
              :key="month.date"
              :class="{ opened: opened.includes(`oldPinebooks-${month.date}`) }"
              @click="toggle(`oldPinebooks-${month.date}`)"
            >
              <td>{{ month.date }}</td>
              <td />
              <td style="text-align:right">
                <font-awesome-icon v-if="opened.includes(`oldPinebooks-${month.date}`)" :icon="faChevronUp" />
                <font-awesome-icon v-else :icon="faChevronDown" />
              </td>
            </tr>
            <template v-if="opened.includes(`oldPinebooks-${month.date}`)">
              <tr
                v-for="iso in month.images"
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
            </template>
          </template>
        </tbody>
      </table>
    </template>

    <template v-if="oldRasPis.length > 0">
      <h3 id="oldRasPis">
        Raspberry Pi 4
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Checksum</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          <template
            v-for="month in oldRasPis"
          >
            <tr
              :key="month.date"
              :class="{ opened: opened.includes(`oldRasPis-${month.date}`) }"
              @click="toggle(`oldRasPis-${month.date}`)"
            >
              <td>{{ month.date }}</td>
              <td />
              <td style="text-align:right">
                <font-awesome-icon v-if="opened.includes(`oldRasPis-${month.date}`)" :icon="faChevronUp" />
                <font-awesome-icon v-else :icon="faChevronDown" />
              </td>
            </tr>
            <template v-if="opened.includes(`oldRasPis-${month.date}`)">
              <tr
                v-for="iso in month.images"
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
            </template>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import {
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mapGetters } from 'vuex'

export default {
  components: {
    FontAwesomeIcon
  },

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

  async fetch () {
    await this.$store.dispatch('images/fetch')
  },

  data () {
    return {
      opened: []
    }
  },

  computed: {
    ...mapGetters('images', ['imagesFor', 'imagesOldForGroupedByDate']),

    latestDaily () {
      const [latest] = this.imagesFor('daily')
      return latest
    },

    latestPinebook () {
      const [latest] = this.imagesFor('daily-pinebookpro')
      return latest
    },

    latestRasPi () {
      const [latest] = this.imagesFor('daily-rpi')
      return latest
    },

    oldDailies () {
      return this.imagesOldForGroupedByDate('daily')
    },

    oldPinebooks () {
      return this.imagesOldForGroupedByDate('daily-pinebookpro')
    },

    oldRasPis () {
      return this.imagesOldForGroupedByDate('daily-rpi')
    },

    faChevronDown: () => faChevronDown,
    faChevronUp: () => faChevronUp
  },

  methods: {
    toggle (id) {
      const index = this.opened.indexOf(id)
      if (index > -1) {
        this.opened.splice(index, 1)
      } else {
        this.opened.push(id)
      }
    }
  }
}
</script>
