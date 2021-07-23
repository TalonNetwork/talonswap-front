<template>
  <div class="overview pd_40_rd_20">
    <div class="head">
      <div class="top flex-center">
        <div class="img1"></div>
        <div class="img2"></div>
        <div class="pair">ETH/USDT</div>
      </div>
      <div class="bottom">2356.87 USDT</div>
    </div>
    <div class="order-history">
      <div class="title">{{ $t("trading.trading1") }}</div>
      <el-table :data="tableData" height="435">
        <el-table-column width="50px"></el-table-column>
        <el-table-column
          prop="symbol"
          :label="$t('trading.trading2')"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="available"
          :label="$t('trading.trading3')"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="lock"
          :label="$t('trading.trading4')"
        ></el-table-column>
        <el-table-column
          prop="total"
          :label="$t('trading.trading5')"
        ></el-table-column>
      </el-table>
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
.overview {
  width: 790px;
  height: 752px;
  margin-right: 40px;
  .head {
    margin-bottom: 45px;
    .img1,
    .img2 {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background-color: red;
    }
    .img2 {
      margin-left: -8px;
      background-color: blue;
    }
    .pair {
      margin-left: 10px;
      font-size: 24px;
    }
    .bottom {
      padding-top: 8px;
      font-size: 36px;
    }
  }
  .order-history {
    .title {
      font-size: 24px;
      margin-bottom: 15px;
    }
    .el-table th .cell {
      font-weight: 400;
    }
  }
}
</style>
