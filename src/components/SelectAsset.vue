<template>
  <div class="select-asset">
    <symbol-icon :icon="icon"></symbol-icon>
    <span>{{ symbol }}</span>
    <i class="el-icon-arrow-down"></i>
  </div>
</template>

<script>
import SymbolIcon from "@/components/SymbolIcon";
export default {
  props: {
    icon: String,
    symbol: String,
    assetList: Array
  },
  components: {
    SymbolIcon
  },
  data() {
    return {};
  },

  watch: {},

  computed: {},

  mounted() {},

  methods: {}
};
</script>
<style lang="scss">
.select-asset {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
