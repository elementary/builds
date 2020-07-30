<template>
  <div>
    <p>Note: This site hosts <strong>pre-release</strong> images and requires signing in with an authorized GitHub account to access. The latest stable version of elementary OS can always be downloaded at <a href="https://elementary.io">elementary.io</a>.</p>

    <div class="download">
      <a class="button" href="https://elementary.io">
        Visit elementary.io
      </a>
      <nuxt-link class="button suggested" to="/downloads">
        See Daily Builds
      </nuxt-link>
    </div>
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
