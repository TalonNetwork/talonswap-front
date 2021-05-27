<template>
  <div class="w1300 liquidity">
    liquidity
  </div>
</template>

<script lang="ts">
  import {ref, defineComponent} from 'vue'

  export default defineComponent({
    name: 'Liquidity',
    props: {},
    setup: () => {
      const count = ref(0);
      return {count}
    }
  })
</script>

<style lang="scss">
  .liquidity {
    min-height: 800px;
  }
</style>
