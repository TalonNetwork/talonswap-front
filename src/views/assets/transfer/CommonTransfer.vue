<template>
  <div class="common-transfer">
    <div class="to-input">
      <el-input :placeholder="$t('transfer.transfer6')"></el-input>
    </div>
    <div class="transfer-content">
      <custom-input></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary">{{ $t("transfer.transfer10") }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
// import { superLong } from "@/api/util";
export default defineComponent({
  name: "commonTransfer",
  components: {
    CustomInput
  },
  props: {
    address: String,
    network: String
  },
  setup() {}
});
</script>

<style lang="scss">
.common-transfer {
  .to-input {
    .el-input {
      border-color: #e3eeff;
    }
    .el-input__inner {
      border-color: #e3eeff;
      height: 58px;
      line-height: 58px;
    }
  }
  .transfer-content {
    margin: 40px 0 60px;
  }
}
</style>
