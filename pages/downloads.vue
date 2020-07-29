<template>
  <div class="container">
    <div class="centergrid">
      <table>
        <thead>
          <tr>
            <th>dailies</th>
            <th>sha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dailyImage) in images.daily" :key="dailyImage">
            <td>
              <a
                :href="`https://elementary-iso.nyc3.digitaloceanspaces.com/daily/${dailyImage}.iso`"
              >{{ dailyImage }}</a>
            </td>
            <td>
              <a
                :href="`https://elementary-iso.nyc3.digitaloceanspaces.com/daily/${dailyImage}.sha256.txt`"
              >{{ dailyImage }}.sha256.txt</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .centergrid {
    display: grid;
    justify-items: center;
  }

  table {
    background-color: var(--view-color);
    border-spacing: 0;
    border-radius: 0.375em;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.22);
    margin: 2em auto;
    max-width: 800px;
    width: 100%;
    text-align: center;

    td,
    th {
      padding: 0.5em 1em;
      text-align: left;
    }

    td {
      border-top: 1px solid #e7e7e7;
    }

    th {
      background-color: #e7e7e7;
      opacity: 0.75;

      &:first-child {
        border-top-left-radius: calc(0.375em - 1px);
      }

      &:last-child {
        border-top-right-radius: calc(0.375em - 1px);
      }
    }
  }

  a {
    color: var(--accent-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>

<script>
import images from '../data/images.json'
import whitelist from '../data/whitelist.json'

export default {
  middleware: ['auth'],

  computed: {
    images: () => images,
    whitelist: () => whitelist
  }
}
</script>
