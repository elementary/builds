<template>
  <div v-if="$auth.loggedIn" class="centergrid">
    {{ $auth.user.login }}
    <button class="button--grey" @click="$auth.logout()">
      logout
    </button>
  </div>
  <div v-else class="centergrid">
    <button class="suggested-action" @click="login('github')">
      Log In with GitHub
    </button>
  </div>
</template>
<style scoped>
.centergrid {
    height: 100vh;
    display: grid;
    align-items: center;
    justify-items: center;
}
button.suggested-action,
.button.suggested-action {
  background-color: #64b9f1;
  background-image: linear-gradient(to bottom, #4ca7e4, #328ecc);
  border-color: #337cac;
  color: #fff;
  text-shadow: 0 1px rgba(0, 0, 0, 0.3);
}
button,
select,
.button {
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-top-color: rgba(0, 0, 0, 0.2);
  border-right-color: rgba(0, 0, 0, 0.2);
  border-bottom-color: rgba(0, 0, 0, 0.2);
  border-left-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.45),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
    0 1px 0 0 rgba(255, 255, 255, 0.15);
  cursor: pointer;
  font-size: 16px;
  padding: 16px 32px;
  transition: all 100ms ease-in;
  margin: auto;
}
</style>
<script>
export default {
  auth: false,
  components: {},
  methods: {
    login (login) {
      this.$auth.loginWith(login)
    }
  }
}
</script>
