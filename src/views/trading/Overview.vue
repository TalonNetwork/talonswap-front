<template>
  <div class="overview pd_40_rd_20">
    <div class="head" v-if="swapSymbol.length !== 0">
      <div class="top flex-center">
        <symbol-icon class="img1" :icon="swapSymbol[0]"></symbol-icon>
        <symbol-icon class="img2" :icon="swapSymbol[1]"></symbol-icon>
        <div class="pair">{{ swapSymbol[0] }}/{{ swapSymbol[1] }}</div>
      </div>
      <div class="bottom">{{ swapRate }}</div>
    </div>
    <div class="order-history">
      <div class="title">{{ $t("trading.trading1") }}</div>
      <el-table
        :data="list"
        height="435"
        v-loading="loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column width="20px"></el-table-column>
        <el-table-column
          prop="time"
          :label="$t('trading.trading2')"
        ></el-table-column>
        <el-table-column :label="$t('trading.trading3')">
          <template #default="scope">
            {{ scope.row.fromAmount }} {{ scope.row.fromSymbol }}
          </template>
        </el-table-column>
        <el-table-column prop="lock" :label="$t('trading.trading4')">
          <template #default="scope">
            {{ scope.row.toAmount }} {{ scope.row.toSymbol }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('trading.trading5')" width="80px">
          <template #default="scope">
            <span class="iconfont icon-chenggong" :scope="scope"></span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import SymbolIcon from "@/components/SymbolIcon.vue";
export default defineComponent({
  props: {
    swapSymbol: {
      type: Array,
      default: () => []
    },
    swapRate: String,
    list: Array,
    loading: Boolean
  },
  components: {
    SymbolIcon
  },
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
    }
    .img2 {
      margin-left: -8px;
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
    :deep(.el-table) {
      th .cell {
        font-size: 16px;
        font-weight: 400;
      }
      tr .cell {
        line-height: 46px;
        font-size: 16px;
        color: #333;
      }
      .iconfont {
        color: #21d8ba;
        font-size: 28px;
      }
    }
  }
}
</style>
