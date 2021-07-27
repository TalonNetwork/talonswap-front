<template>
  <div class="detail-bar">
    <el-input placeholder=""></el-input>
    <div class="rate">
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>100%</span>
    </div>
    <div class="confirm-wrap">
      <el-button>{{ $t("liquidity.liquidity6") }}</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
export default defineComponent({
  setup() {
    return {};
  }
});
</script>

<style lang="scss" scoped>
.detail-bar {
  height: 174px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #e4efff;
  .rate {
    margin: 10px 0 20px;
    display: flex;
    span {
      width: 65px;
      height: 28px;
      background-color: #e3eeff;
      color: #4a5ef2;
      text-align: center;
      line-height: 28px;
      border-radius: 6px;
      margin-right: 30px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  :deep(.el-input) {
    border: 1px solid #e4efff;
  }
}
</style>
