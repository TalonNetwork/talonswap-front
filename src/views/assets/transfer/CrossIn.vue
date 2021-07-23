<template>
  <div class="cross-in">
    <div class="title">
      {{ $t("transfer.transfer4") + network + $t("transfer.transfer5") }}
      <span>
        {{ superLong("adhkaldgfkj46514653adfdfadf") }}
        <i class="el-icon-position"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary">{{ $t("transfer.transfer9") }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
// import { superLong } from "@/api/util";
export default defineComponent({
  name: "crossIn",
  components: {
    CustomInput
  },
  props: {
    address: String,
    network: String
  },
  setup() {
    const crossInVal = ref("");
    function superLong(str: string, len = 9): string {
      return "132465";
      // return superLong(str, len);
    }
    return {
      crossInVal,
      superLong
    };
  }
});
</script>

<style lang="scss" scoped>
.cross-in {
  .title {
    font-size: 18px;
    span {
      color: #4a5ef2;
    }
  }
  .transfer-content {
    margin: 35px 0 60px;
  }
}
</style>
