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
      <div class="your-liquidity" v-if="talonAddress">
        <h3>{{ $t("liquidity.liquidity4") }}</h3>
        <div class="liquidity-list">
          <div v-for="(item, index) in liquidityList" :key="index">
            <div :class="['list-item', item.showDetail ? 'hide-border' : '']">
              <div class="symbol">
                <div class="img-wrap">
                  <symbol-icon
                    class="symbol1"
                    :icon="item.fromSymbol"
                  ></symbol-icon>
                  <symbol-icon
                    class="symbol2"
                    :icon="item.toSymbol"
                  ></symbol-icon>
                </div>
                <span>{{ item.symbol }}</span>
              </div>
              <div class="value">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="item.amount"
                  placement="top"
                >
                  <span class="click">{{ item.amountSlice }}</span>
                </el-tooltip>
              </div>
              <div class="view-detail" @click="toggleDetail(item)">
                {{ $t("liquidity.liquidity5") }}
                <i
                  :class="{
                    'el-icon-arrow-right': true,
                    expand: item.showDetail
                  }"
                ></i>
              </div>
            </div>
            <collapse-transition>
              <detail-bar v-show="item.showDetail"></detail-bar>
            </collapse-transition>
          </div>
          <div class="no-data" v-if="!liquidityList.length">No Data</div>
        </div>
      </div>
    </div>
    <add-liquidity
      v-else
      v-model:show="addLiquidity"
      :assetsList="assetsList"
      :talonAddress="talonAddress"
      @updateList="getUserLiquidity"
    ></add-liquidity>
  </div>
</template>

<script>
import {
  ref,
  defineComponent,
  computed,
  onMounted,
  reactive,
  toRefs
} from "vue";
import AddLiquidity from "./AddLiquidity.vue";
import CollapseTransition from "@/components/CollapseTransition.vue";
import DetailBar from "./DetailBar.vue";
import { useStore } from "vuex";
import { getAssetList, userLiquidityPage } from "@/model";
import { divisionAndFix } from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
export default defineComponent({
  name: "liquidity",
  components: {
    AddLiquidity,
    CollapseTransition,
    DetailBar,
    SymbolIcon
  },
  props: {},
  setup: () => {
    const store = useStore();
    const talonAddress = computed(() => store.getters.talonAddress);
    const state = reactive({
      addLiquidity: false,
      assetsList: [],
      liquidityList: []
    });
    onMounted(async () => {
      state.assetsList = await getAssetList(talonAddress.value);
      getUserLiquidity();
    });

    async function getUserLiquidity() {
      if (talonAddress.value) {
        const res = await userLiquidityPage({
          userAddress: talonAddress.value
        });
        if (res) {
          const list = [];
          res.list.map(v => {
            const info = v.lpTokenAmount;
            const amountSlice = divisionAndFix(info.amount, info.token.decimals, 2);
            list.push({
              fromSymbol: v.token0.symbol,
              toSymbol: v.token1.symbol,
              symbol: info.token.symbol,
              amount: divisionAndFix(
                info.amount,
                info.token.decimals,
                info.token.decimals
              ),
              amountSlice: amountSlice == 0 ? "0.00" : amountSlice,
              showDetail: false
            });
          });
          state.liquidityList = list;
        }
      }
    }

    function toggleDetail(item) {
      item.showDetail = !item.showDetail;
    }
    return { talonAddress, ...toRefs(state), toggleDetail };
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
        &.hide-border {
          border: none;
        }
      }
      .symbol {
        flex: 5;
        display: flex;
        align-items: center;
        img {
          width: 32px;
          height: 32px;
          overflow: hidden;
        }
        .img-wrap {
          display: flex;
          align-items: center;
          margin-right: 10px;
        }
        .symbol1 {
          z-index: 2;
        }
        .symbol2 {
          margin-left: -10px;
        }
      }
      .value {
        flex: 3;
        text-align: center;
      }
      .view-detail {
        flex: 2;
        color: #4a5ef2;
        text-align: right;
        cursor: pointer;
      }
    }
    .no-data {
      padding-top: 40px;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
