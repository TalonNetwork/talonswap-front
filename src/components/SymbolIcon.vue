<template>
  <img class="symbol-icon" :src="getIconSrc(icon)" alt="" @error="replaceImg" />
</template>

<script>
import { defineComponent } from "vue";
import { getIconSrc } from "@/api/util";
import defaultIcon from "@/assets/Talon.svg";
export default defineComponent({
  props: {
    icon: String
  },
  name: "SymbolIcon",
  setup() {
    function replaceImg(e) {
      e.target.src = defaultIcon;
    }
    return {
      getIconSrc,
      replaceImg
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
