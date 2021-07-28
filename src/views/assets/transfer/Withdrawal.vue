<template>
  <div class="cross-out">
    <div class="title">
      {{
        $t("transfer.transfer7") +
        " " +
        father.network +
        $t("transfer.transfer8")
      }}
      <span>
        {{ superLong(father.address) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input :icon="transferAsset.symbol"></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary">{{ $t("transfer.transfer11") }}</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
import { superLong } from "@/api/util";
export default defineComponent({
  name: "withdrawal",
  inject: ["father"],
  components: {
    CustomInput
  },
  data() {
    return {
      transferAsset: {}
    };
  },
  methods: {
    superLong(str, len = 8) {
      return superLong(str, len);
    }
  },
  mounted() {
    this.transferAsset = { ...this.father.transferAsset };
    // console.log(this.father, 666);
    // console.log(this.$attrs, 666, this.transferAsset);
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
