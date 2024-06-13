<template>
  <header>
    <nav>
      <ul>
        <li>
          <a href="https://elementary.io" class="logomark" target="_self">
            <elementary-logomark />
          </a>
        </li>

        <li>
          <a href="https://elementary.io/support" target="_self">Support</a>
        </li>

        <li>
          <a href="https://developer.elementary.io" target="_self">Developer</a>
        </li>

        <li>
          <a href="https://elementary.io/get-involved" target="_self">Get Involved</a>
        </li>

        <li>
          <a href="https://store.elementary.io" target="_self">Store</a>
        </li>

        <li>
          <a href="https://blog.elementary.io" target="_self">Blog</a>
        </li>
      </ul>

      <ul>
        <li>
          <a href="https://mastodon.social/@elementary" target="_blank" rel="noopener" aria-label="Mastodon" title="Mastodon">
            <font-awesome-icon :icon="faMastodon" aria-hidden="true" />
          </a>
        </li>

        <li>
          <a href="https://www.reddit.com/r/elementaryos" target="_blank" rel="noopener" aria-label="Reddit" title="Reddit">
            <font-awesome-icon :icon="faReddit" aria-hidden="true" />
          </a>
        </li>

        <li>
          <a href="https://community-slack.elementary.io" target="_blank" rel="noopener" aria-label="Slack" title="Slack">
            <font-awesome-icon :icon="faSlack" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </nav>

    <nav v-if="loggedIn" class="secondary">
      <ul>
        <li>
          <a @click="logout">
            Log Out
          </a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
import {
  faMastodon,
  faReddit,
  faSlack,
  faStackExchange
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: {
    FontAwesomeIcon
  },

  computed: {
    faMastodon: () => faMastodon,
    faReddit: () => faReddit,
    faSlack: () => faSlack,
    faStackExchange: () => faStackExchange,

    loggedIn () {
      return this.$store.getters['auth/loggedIn']
    }
  },

  methods: {
    logout () {
      this.$store.commit('auth/clear')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
  header {
    background-color: var(--header-bg-color);
    color: var(--header-fg-color);
    fill: var(--header-fg-color);
  }

  nav {
    display: flex;
    font-size: 0;
    justify-content: space-between;
    overflow-x: auto;
    padding: 0 1rem;
  }

  ul {
    display: inline-block;
    flex: 0 0 auto;
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
    list-style: none;
    vertical-align: middle;
  }

  a {
    color: var(--header-fg-color);
    display: inline-block;
    font-family: var(--ui-font);
    font-size: 0.85rem;
    line-height: 2.9em;
    opacity: 1;
    padding: 0 0.65rem;
    text-decoration: none;
  }

  a:hover {
    opacity: 0.7;
  }

  svg {
    height: 1em;

    * {
      fill: inherit !important;
    }
  }

  .logomark {
    line-height: 0;

    svg {
      height: auto;
    }
  }

  nav.secondary {
    background-color: var(--secondary-bg-color);

    a {
      color: var(--secondary-fg-color);
      font-family: var(--ui-font);
      cursor: pointer;
    }

    ul {
      margin-left: auto;
    }
  }
</style>
