<template>
  <div class="w1300 bottom"></div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "Bottom",
  props: {
    /* msg: {
         type: String,
         required: true
       }*/
  },
  setup: () => {
    const count = ref(0);
    return { count };
  },
});
</script>

<style lang="scss">
.bottom {
}
</style>
