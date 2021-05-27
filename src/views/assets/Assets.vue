<template>
  <div class="w1300 trading">
    trading
  </div>
</template>

<script lang="ts">
  import {ref, defineComponent} from 'vue'

  export default defineComponent({
    name: 'Trading',
    props: {},
    setup: () => {
      const count = ref(0);
      return {count}
    }
  })
</script>

<style lang="scss">
  .trading {
    min-height: 800px;
  }
</style>
