<template>
  <div id="__page">
    <layout-navbar />

    <nuxt id="__content" />

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

  #__nuxt,
  #__layout,
  #__page {
    min-height: 100vh;
    min-width: 100vw;
  }

  #__page {
    align-content: stretch;
    align-items: stretch;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }

  #__content {
    flex: 1 0 auto;
    margin: 0 auto;
    max-width: var(--page-width);
    padding: 0 1rem;
  }
</style>
