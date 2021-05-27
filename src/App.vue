<template>
  <div class="app">
    <Header>
    </Header>
    <router-view>
    </router-view>
    <Bottom>
    </Bottom>
  </div>

</template>

<script lang="ts">
  import Header from './components/Header.vue'
  import Bottom from './components/Bottom.vue'

  export default {
    name: 'App',
    components: {
      Header, Bottom
    }
  }
</script>

<style lang="scss">
  @import "assets/css/base.scss";

  .app {
    width: 100%;
    height: 100%;
    background: url("assets/imges/bg.jpg");
  }
</style>
