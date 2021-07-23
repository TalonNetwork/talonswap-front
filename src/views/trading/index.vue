<template>
  <div class="w1300 trading-page">
    <overview v-if="showOverview"></overview>
    <swap @toggleExpand="toggleExpand"></swap>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import Overview from "./Overview.vue";
import Swap from "./Swap.vue";
export default defineComponent({
  name: "trading",
  components: {
    Overview,
    Swap
  },
  props: {},
  setup: () => {
    const showOverview = ref(false)
    function toggleExpand() {
      showOverview.value = !showOverview.value
    }
    return { showOverview, toggleExpand };
  },
});
</script>

<style lang="scss">
.trading-page {
  display: flex;
  justify-content: center;
}
</style>
