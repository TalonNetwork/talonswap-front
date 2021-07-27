<template>
  <div class="cross-out">
    <div class="title">
      {{ $t("transfer.transfer7") + network + $t("transfer.transfer8") }}
      <span>
        {{ "adhkalfadf" }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary">{{ $t("transfer.transfer11") }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
export default defineComponent({
  name: "withdrawal",
  components: {
    CustomInput
  },
  props: {
    address: String,
    network: String
  },
  setup() {
  }
});
</script>

<style lang="scss" scoped>
.cross-out {
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
