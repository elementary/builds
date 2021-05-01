<template>
  <div>
    <h2>Public Beta</h2>
    <p>elementary OS 6 Public Beta is here for developers and testers!</p>

    <div class="download">
      <a class="button" href="https://blog.elementary.io/elementary-os-6-odin-beta">
        Read Announcement
      </a>
      <nuxt-link class="button suggested" to="/beta">
        Get elementary OS 6 Public Beta
      </nuxt-link>
    </div>

    <h2>Early Access</h2>
    <p>Early Access includes daily builds and builds for experimental platforms like Raspberry Pi 4 and Pinebook Pro. Eligible accounts include OEMs, first-party contributors, $25+ <a href="https://www.indiegogo.com/projects/appcenter-for-everyone#/updates/21" target="_blank" rel="noopener">AppCenter for Everyone</a> backers, and $10/month and higher <a href="https://github.com/sponsors/elementary">GitHub Sponsors</a>.</p>

    <div class="download">
      <nuxt-link class="button suggested" to="/downloads">
        Get Early Access Builds
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
