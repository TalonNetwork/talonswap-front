<template>
  <img class="symbol-icon" :src="getIconSrc(icon)" alt="" />
</template>

<script>
import { defineComponent } from "vue";
import { getIconSrc } from "@/api/util";
export default defineComponent({
  props: {
    icon: String
  },
  name: "SymbolIcon",
  setup() {
    return {
      getIconSrc
    };
  }
});
</script>

<style lang="scss">
.symbol-icon {
  width: 35px;
  height: 35px;
}
</style>
