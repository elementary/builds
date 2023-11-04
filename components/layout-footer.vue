<template>
  <footer>
    <p>© {{ year }} elementary, Inc</p>

    <ul>
      <li>
        <a href="https://elementary.io/press" target="_self">Press</a>
      </li>

      <li>
        <a href="https://elementary.io/brand" target="_self">Brand</a>
      </li>

      <li>
        <a href="https://elementary.io/oem" target="_self">OEMs</a>
      </li>

      <li>
        <a href="https://elementary.io/privacy" target="_self">Privacy</a>
      </li>

      <li>
        <a href="https://elementary.io/team" target="_self">Team</a>
      </li>

      <li>
        <a href="https://elementary.io/open-source" target="_self">Open Source</a>
      </li>
    </ul>
  </footer>
</template>

<script>
export default {
  computed: {
    year () {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
  footer {
    background-color: var(--secondary-bg-color);
    display: flex;
    flex-flow: wrap-reverse;
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
    display: inline-block;
    opacity: 1;
    padding: 0 0.4rem;
    text-decoration: none;
  }

  a,
  p {
    color: var(--secondary-fg-color);
    font-family: var(--ui-font);
    font-size: 0.6rem;
    line-height: 3em;
    margin: 0;
  }
</style>
