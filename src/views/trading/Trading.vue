<template>
  <div class="w1300 assets">
    assets
  </div>
</template>

<script lang="ts">
  import {ref, defineComponent} from 'vue'

  export default defineComponent({
    name: 'Assets',
    props: {},
    setup: () => {
      const count = ref(0);
      return {count}
    }
  })
</script>

<style lang="scss">
  .assets {
    min-height: 800px;
  }
</style>
