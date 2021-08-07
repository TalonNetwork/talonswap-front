<template>
  <div class="w1300 trading-page">
    <overview v-if="showOverview"></overview>
    <swap :assetsList="assetsList" @toggleExpand="toggleExpand"></swap>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, computed } from "vue";
import Overview from "./Overview.vue";
import Swap from "./Swap.vue";
import { useStore } from "vuex";
import { getAssetList } from "@/model";
export default defineComponent({
  name: "trading",
  components: {
    Overview,
    Swap
  },
  props: {},
  setup() {
    const store = useStore();
    const showOverview = ref(false);
    function toggleExpand() {
      showOverview.value = !showOverview.value;
    }

    const talonAddress = computed(() => store.getters.talonAddress);
    const assetsList = ref([]);
    onMounted(async () => {
      assetsList.value = await getAssetList(talonAddress.value);
    });

    return {
      showOverview,
      toggleExpand,
      assetsList
    };
  }
});
</script>

<style lang="scss">
.trading-page {
  display: flex;
  justify-content: center;
}
</style>
