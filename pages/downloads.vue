<template>
  <div>
    <div v-if="pending" class="center">
      <p>Loading available builds...</p>
    </div>

    <div v-else-if="error || imagesStore.error" class="center error-box">
      <h2>Error Loading Builds</h2>
      <p>{{ errorMessage }}</p>
      <button @click="() => refresh()">Retry</button>
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

      <template v-if="latestStableArm64">
        <h3>64-bit Native ARM</h3>
        <p>
          <code>{{ getName(latestStableArm64) }}</code> was built {{
            getRelativeDate(latestStableArm64) }}.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestStableArm64)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestStableArm64)">
            Download ({{ getSize(latestStableArm64) }} GB)
          </a>
        </div>
      </template>

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

      <template v-if="latestDailyArm64">
        <h3>64-bit Native ARM</h3>
        <p>
          <code>{{ getName(latestDailyArm64) }}</code> was built {{
            getRelativeDate(latestDailyArm64) }}. If it does not install or
          otherwise work for you, try a <a href="#oldDailiesArm64">previous build</a>.
        </p>
        <div class="center">
          <a class="button" :href="getShaUrl(latestDailyArm64)">Download SHA256</a>
          <a class="button suggested" :href="getIsoUrl(latestDailyArm64)">
            Download ({{ getSize(latestDailyArm64) }} GB)
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

      <template v-if="oldDailiesArm64.length > 0">
        <details>
          <summary>
            <h3 id="oldDailiesArm64">64-bit Native ARM</h3>
          </summary>
          <table>
            <thead>
              <tr><th>Name</th><th>Checksum</th><th>Date</th></tr>
            </thead>
            <tbody>
              <tr v-for="iso in oldDailiesArm64" :key="iso.path">
                <td><a :href="getIsoUrl(iso)">{{ getName(iso) }}</a></td>
                <td><a :href="getShaUrl(iso)">SHA256</a></td>
                <td>{{ getRelativeDate(iso) }}</td>
              </tr>
            </tbody>
          </table>
        </details>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#app'
import { useImagesStore } from '~/stores/images'
import DisclaimerText from '~/components/disclaimer-text.vue'

definePageMeta({
  middleware: 'auth'
});

const imagesStore = useImagesStore()

const { pending, error, refresh } = await useAsyncData(
  'images',
  () => imagesStore.fetchImages(),
  {
  }
);

const errorMessage = computed(() => {
  const e = error.value ?? imagesStore.error;
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message);
  return 'An unknown error occurred.';
});

const latestStable = computed(() => imagesStore.getImagesFor('stable')[0]);
const latestStableArm64 = computed(() => imagesStore.getImagesFor('stable-arm64')[0]);
const latestDaily = computed(() => imagesStore.getImagesFor('daily')[0]);
const latestDailyArm64 = computed(() => imagesStore.getImagesFor('daily-arm64')[0]);

const oldDailies = computed(() => imagesStore.getImagesFor('daily').slice(1));
const oldDailiesArm64 = computed(() => imagesStore.getImagesFor('daily-arm64').slice(1));

const getIsoUrl = (iso: { path: string }): string => {
  return `/api/download/${iso.path}`;
};

const getName = (iso: { path: string }): string => {
  const parts = iso.path.split('/');
  return parts[parts.length - 1] || 'unknown';
};

const getRelativeDate = (iso: { path: string }): string => {
  // The YYYYMMDD date encoded in the filename is authoritative for the build
  // date; the S3 LastModified timestamp can drift (e.g. on re-upload).
  const match = iso.path.match(/([0-9]{4})([0-9]{2})([0-9]{2})/);
  if (!match) return 'Invalid Date';
  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T01:00:00.000Z`);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
