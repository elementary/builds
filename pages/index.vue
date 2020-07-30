<template>
  <div class="center">
    <h1>elementary Build ISOs</h1>

    <nuxt-link to="/downloads">
      Download
    </nuxt-link>
  </div>
</template>

<style scoped>
  a {
    appearance: none;
    background-color: var(--grape-700);
    border-color: transparent;
    border-radius: 3px;
    border: none;
    color: #fff;
    display: inline-block;
    font-family: inherit;
    font-family: var(--ui-font);
    font-size: 16px;
    font-weight: 600;
    margin: 24px;
    min-width: 250px;
    outline: none;
    padding: 7px;
    text-align: center;
    text-decoration: none;
    text-rendering: optimizeLegibility;
    transition: opacity 200ms ease;
  }

  a:hover,
  a:focus,
  a:active {
    background-color: var(--grape-500);
    box-shadow:
      0 2px 3px -1px rgba(73, 55, 147, 0.3),
      0 5px 10px -2px rgba(156, 100, 218, 0.5);
    opacity: 0.8;
  }
</style>
