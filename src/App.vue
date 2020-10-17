<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <router-link
        class="navbar-brand"
        to="/">
        open-lifelogging
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon" />
      </button>

      <div
        id="navbarSupportedContent"
        class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a
              class="nav-link"
              href="/feed">Feed</a>
          </li>

          <li class="nav-item">
            <a
              class="nav-link"
              href="/map">Map</a>
          </li>
        </ul>

        <Options class="navbar-nav" />
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script>
  import Options from "@/components/Options";

  export default {
    components: {
      Options,
    },
  }
</script>

<style lang="scss" scoped>
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2e2e2e;
  }
</style>
