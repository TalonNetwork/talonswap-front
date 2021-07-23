<template>
  <div class="w1300 home">{{ $t("home.home1") }}</div>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "Home",
  props: {},
  setup: () => {
    const count = ref(0);
    return { count };
  },
};
</script>

<style lang="scss">
.home {
  /* min-height: 908px; */
}
</style>
