<template>
  <div id="__page">
    <layout-navbar />

    <div class="wrapper">
      <h1>elementary OS Early Access</h1>
      <p>Get your hands on Early Access builds of elementary OS. The latest stable version of elementary OS can always be downloaded at <a href="https://elementary.io">elementary.io</a>.</p>

      <nuxt id="__content" />
    </div>
    <layout-footer />
  </div>
</template>

<style lang="scss">
  :root {
    color-scheme: light dark;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
  }

  body,
  html {
    background-color: var(--bg-color);
    color: var(--fg-color);
    fill: var(--fg-color);
    margin: 0;
    overflow-x: hidden;
  }

  html {
    background-color: var(--secondary-bg-color);
  }

  svg {
    fill: inherit;
  }

  /* stylelint-disable-next-line selector-id-pattern */
  #__nuxt,
  #__layout,
  #__page {
    min-height: 100vh;
    min-width: 100vw;
  }

  /* stylelint-disable-next-line selector-id-pattern */
  #__page {
    place-content: stretch stretch;
    align-items: stretch;
    display: flex;
    flex-direction: column;
  }

  .wrapper {
    flex: 1 0 auto;
  }

  /* stylelint-disable-next-line selector-id-pattern */
  #__content {
    flex: 1 0 auto;
    margin: 0 auto;
    max-width: var(--page-width);
    padding: 0 1rem;
  }
</style>
