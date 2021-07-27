<template>
  <Header></Header>
  <router-view></router-view>
  <Bottom></Bottom>
</template>

<script lang="ts">
import Header from "./components/Header.vue";
import Bottom from "./components/Bottom.vue";

export default {
  name: "App",
  components: {
    Header,
    Bottom
  }
};
</script>

<style lang="scss">
@import "assets/css/base.scss";

#app {
  width: 100%;
  min-height: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url("assets/img/bg.jpg");
}
</style>
