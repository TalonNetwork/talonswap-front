<template>
  <div class="w1300 home">
    home
  </div>
</template>

<script lang="ts">
  import {ref} from 'vue'

  export default {
    name: 'Home',
    props: {},
    setup: () => {
      const count = ref(0);
      return {count}
    }
  }
</script>

<style lang="scss">
  .home {
    min-height: 908px;
  }
</style>
