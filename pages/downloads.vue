<template>
  <div>
    <div v-if="pending" class="center">
      <p>Loading available builds...</p>
    </div>

    <div v-else-if="error || imagesStore.error" class="center error-box">
      <h2>Error Loading Builds</h2>
      <p>{{ error?.message || imagesStore.error?.message || 'An unknown error occurred.' }}</p>
      <button @click="refresh">Retry</button>
    </div>

    <template v-else>
      <h2>Stable (RC) Builds</h2>
      <p>
        These releases are built with the stable repos and are considered release
        candidate (RC) quality. Configuration changes may occur between one build
        and the next, but generally they should be safe to use.
      </p>

      <template v-if="latestStable">
        <h3>64-bit AMD/Intel</h3>
        <p>
          <code>{{ getName(latestStable) }}</code> was built {{
            getRelativeDate(latestStable) }}.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestStable)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestStable)">
            Download ({{ getSize(latestStable) }} GB)
          </a>
        </div>
      </template>
      <p v-else>No stable builds found.</p>

      <h2>Daily Builds</h2>
      <DisclaimerText />

      <template v-if="latestDaily">
        <h3>64-bit AMD/Intel</h3>
        <p>
          <code>{{ getName(latestDaily) }}</code> was built {{
            getRelativeDate(latestDaily) }}. If it does not install or
          otherwise work for you, try a <a href="#oldDailies">previous build</a>.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestDaily)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestDaily)">
            Download ({{ getSize(latestDaily) }} GB)
          </a>
        </div>
      </template>
      <p v-else>No daily builds found.</p>

      <template v-if="latestPinebook">
        <h3>Pinebook Pro</h3>
         <p>
          <strong>Experimental build</strong>; see
          <a href="https://github.com/elementary/os/wiki/Pinebook-Pro" target="_blank" rel="noopener">the wiki</a>
          for more info.
        </p>
        <p>
          <code>{{ getName(latestPinebook) }}</code> was built
          {{ getRelativeDate(latestPinebook) }}. If it does not install or
          otherwise work for you, try a <a href="#oldPinebooks">previous build</a>.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestPinebook)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestPinebook)">
            Download ({{ getSize(latestPinebook) }} GB)
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
          <code>{{ getName(latestRasPi) }}</code> was built
          {{ getRelativeDate(latestRasPi) }}. If it does not install or
          otherwise work for you, try a <a href="#oldRasPis">previous build</a>.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestRasPi)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestRasPi)">
            Download ({{ getSize(latestRasPi) }} GB)
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
            <h3 id="oldDailies">64-bit AMD/Intel</h3>
          </summary>
          <table>
            <thead>
              <tr><th>Name</th><th>Checksum</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr v-for="iso in oldDailies" :key="iso.path">
                <td><a :href="getIsoUrl(iso)">{{ getName(iso) }}</a></td>
                <td><a :href="getShaUrl(iso)">SHA256</a></td>
                <td>{{ getRelativeDate(iso) }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </template>
      <p v-else>No previous daily builds found.</p>

      <template v-if="oldPinebooks.length > 0">
        <details>
          <summary>
            <h3 id="oldPinebooks">Pinebook Pro</h3>
          </summary>
          <table>
             <thead>
              <tr><th>Name</th><th>Checksum</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr v-for="iso in oldPinebooks" :key="iso.path">
                <td><a :href="getIsoUrl(iso)">{{ getName(iso) }}</a></td>
                <td><a :href="getShaUrl(iso)">SHA256</a></td>
                <td>{{ getRelativeDate(iso) }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </template>
      <p v-else>No previous Pinebook Pro builds found.</p>

       <template v-if="oldRasPis.length > 0">
        <details>
          <summary>
            <h3 id="oldRasPis">Raspberry Pi 4</h3>
          </summary>
          <table>
             <thead>
              <tr><th>Name</th><th>Checksum</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr v-for="iso in oldRasPis" :key="iso.path">
                <td><a :href="getIsoUrl(iso)">{{ getName(iso) }}</a></td>
                <td><a :href="getShaUrl(iso)">SHA256</a></td>
                <td>{{ getRelativeDate(iso) }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </template>
      <p v-else>No previous Raspberry Pi builds found.</p>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useError, navigateTo } from '#app'
import { useImagesStore } from '~/stores/images'
import { useAuthStore } from '~/stores/auth'
import DisclaimerText from '~/components/disclaimer-text.vue'

definePageMeta({
  middleware: 'auth'
});

const imagesStore = useImagesStore()
const authStore = useAuthStore()
const errorState = useError()

const { pending, error, refresh } = await useAsyncData(
  'images',
  () => imagesStore.fetchImages(),
  {
  }
);

const latestStable = computed(() => imagesStore.getImagesFor('stable')[0]);
const latestDaily = computed(() => imagesStore.getImagesFor('daily')[0]);
const latestPinebook = computed(() => imagesStore.getImagesFor('daily-pinebookpro')[0]);
const latestRasPi = computed(() => imagesStore.getImagesFor('daily-rpi')[0]);

const oldDailies = computed(() => imagesStore.getImagesFor('daily').slice(1));
const oldPinebooks = computed(() => imagesStore.getImagesFor('daily-pinebookpro').slice(1));
const oldRasPis = computed(() => imagesStore.getImagesFor('daily-rpi').slice(1));

const getIsoUrl = (iso: { path: string }): string => {
  return `/api/download/${iso.path}`;
};

const getName = (iso: { path: string }): string => {
  const parts = iso.path.split('/');
  return parts[parts.length - 1] || 'unknown';
};

const getRelativeDate = (iso: { timestamp: Date | string }): string => {
  try {
    const date = new Date(iso.timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(undefined, {
      timeZone: 'UTC',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};

const getShaUrl = (iso: { path: string }): string => {
  const basePath = `/api/download/${iso.path}`;
  if (basePath.endsWith('.iso')) {
      return basePath.replace('.iso', '.sha256.txt');
  }
  if (basePath.endsWith('.img.xz')) {
      return basePath.replace('.img.xz', '.sha256.txt');
  }
  return `${basePath}.sha256.txt`;
};

const getSize = (iso: { size: number }): string => {
  return (iso.size / 1000000000).toFixed(2);
};

</script>
