<template>
  <div class="container">
    <div>
      <div v-if="$auth.loggedIn && whitelist.users.includes($auth.user.login)">
        <div class="account">
          {{ $auth.user.login }}
          <button class="button--grey" @click="logout()">logout</button>
        </div>
        <Downloads />
      </div>
      <div v-else>
        <p>unauthorized</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account {
  float: right;
}
</style>

<script>
import Downloads from '../components/Downloads.vue';
import whitelist from '../data/whitelist.json';

export default {
  components: {
    Downloads,
  },
  methods: {
    logout() {
      if (this.$auth.loggedIn) {
        this.$auth.logout().then(() => {
          this.$router.push('login');
        });
      }
    },
  },
  data() {
    return {
      whitelist,
    };
  },
};
</script>
