<template>
  <div>
    <h1>elementary OS Early Access Builds</h1>
    <p>You must sign in with an authorized GitHub account for access. Authorized accounts include OEMs, first-party contributors, $25+ <a href="https://www.indiegogo.com/projects/appcenter-for-everyone#/updates/21" target="_blank" rel="noopener">AppCenter for Everyone</a> backers, and $10/month and higher <a href="https://github.com/sponsors/elementary">GitHub Sponsors</a>.</p>
    <p>The latest stable version of elementary OS can always be downloaded at <a href="https://elementary.io">elementary.io</a>.</p>

    <div class="download">
      <a class="button" href="https://elementary.io">
        Visit elementary.io
      </a>
      <nuxt-link class="button suggested" to="/downloads">
        Get Early Access Builds
      </nuxt-link>
    </div>

    <disclaimer />
  </div>
</template>

<style scoped>
  p {
    max-width: var(--content-width);
  }

  .download {
    text-align: center;
  }
</style>
