<template>
  <div class="w1300 liquidity">
    <div class="overview" v-if="!addLiquidity">
      <div class="top-part">
        <div class="title">
          <h3>{{ $t("liquidity.liquidity1") }}</h3>
          <p>{{ $t("liquidity.liquidity2") }}</p>
        </div>
        <div class="confirm-wrap">
          <el-button type="primary" @click="addLiquidity = true">
            {{ $t("liquidity.liquidity3") }}
          </el-button>
        </div>
      </div>
      <div class="your-liquidity">
        <h3>{{ $t("liquidity.liquidity4") }}</h3>
        <div class="liquidity-list">
          <div>
            <div class="list-item">
              <div class="symbol">
                <div class="symbol1"></div>
                <div class="symbol2"></div>
                <span>BNB-USDT</span>
              </div>
              <div class="value">0.05</div>
              <div class="view-detail" @click="toggleDetail">
                {{ $t("liquidity.liquidity5") }}
              </div>
            </div>
            <collapse-transition>
              <detail-bar v-show="showDetail"></detail-bar>
            </collapse-transition>
          </div>
        </div>
      </div>
    </div>
    <add-liquidity v-else v-model:show="addLiquidity"></add-liquidity>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import AddLiquidity from "./AddLiquidity.vue";
import CollapseTransition from "@/components/CollapseTransition.vue";
import DetailBar from "./DetailBar.vue";
export default defineComponent({
  name: "liquidity",
  components: {
    AddLiquidity,
    CollapseTransition,
    DetailBar
  },
  props: {},
  setup: () => {
    const addLiquidity = ref(false);
    const showDetail = ref(false);
    function toggleDetail() {
      showDetail.value = !showDetail.value;
    }
    return { addLiquidity, showDetail, toggleDetail };
  }
});
</script>

<style lang="scss">
.liquidity {
  width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  background-color: #fff;
  h3 {
    font-size: 24px;
  }
  .top-part {
    padding: 40px;
    h3 {
      margin-bottom: 5px;
    }
    .confirm-wrap {
      margin-top: 36px;
    }
  }
  .your-liquidity {
    padding: 40px;
    border-top: 1px solid #e4efff;
    .liquidity-list {
      margin-top: -10px;
      .list-item {
        height: 74px;
        padding: 20px 0;
        border-bottom: 1px solid #e4efff;
        display: flex;
        align-items: center;
      }
      .symbol {
        flex: 5;
      }
      .value {
        flex: 3;
      }
      .view-detail {
        flex: 2;
        color: #4a5ef2;
        text-align: right;
        cursor: pointer;
      }
    }
  }
}
</style>
