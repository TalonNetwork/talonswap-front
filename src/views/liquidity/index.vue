<template>
  <div class="w1300">
    <div
      class="liquidity"
      v-loading="loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
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
        <div
          class="your-liquidity"
          v-if="talonAddress"
          v-loading="myLoading"
          element-loading-background="rgba(255, 255, 255, 0.8)"
        >
          <h3>{{ $t("liquidity.liquidity4") }}</h3>
          <div class="liquidity-list">
            <div v-for="(item, index) in liquidityList" :key="index">
              <div :class="['list-item', item.showDetail ? 'hide-border' : '']">
                <div class="symbol">
                  <div class="img-wrap">
                    <symbol-icon
                      class="symbol1"
                      :icon="item.token0.symbol"
                    ></symbol-icon>
                    <symbol-icon
                      class="symbol2"
                      :icon="item.token1.symbol"
                    ></symbol-icon>
                  </div>
                  <span>{{ item.lpTokenAmount.token.symbol }}</span>
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
                <detail-bar
                  v-show="item.showDetail"
                  :talonAddress="talonAddress"
                  :info="item"
                  @loading="handleLoadig"
                ></detail-bar>
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
      liquidityList: [],
      myLoading: false,
      loading: false
    });
    onMounted(async () => {
      getUserLiquidity();
      state.assetsList = await getAssetList(talonAddress.value);
    });
    async function getUserLiquidity() {
      console.log(talonAddress.value, 99);
      if (talonAddress.value) {
        state.myLoading = true;
        const res = await userLiquidityPage({
          userAddress: talonAddress.value
        });
        if (res) {
          console.log(res, "resresres")
          const list = [];
          res.list.map(v => {
            const info = v.lpTokenAmount;
            const amountSlice = divisionAndFix(
              info.amount,
              info.token.decimals,
              2
            );
            v.amountSlice = amountSlice;
            v.amount = divisionAndFix(
              info.amount,
              info.token.decimals,
              info.token.decimals
            );
            v.showDetail = false;

            /* list.push({
              fromToken: {
                symbol: v.token0.symbol,
                chainId: v.token0.assetChainId,
                assetId: v.token0.assetId,
                decimal: v.token0.decimals
              },
              fromSymbol: v.token0.symbol,
              toSymbol: v.token1.symbol,
              symbol: info.token.symbol,
              // fromKey: v.token0.
              amount: divisionAndFix(
                info.amount,
                info.token.decimals,
                info.token.decimals
              ),
              amountSlice: amountSlice == 0 ? "0.00" : amountSlice,
              showDetail: false
            }); */
          });
          state.liquidityList = res.list;
        }
        state.myLoading = false;
      }
    }

    function toggleDetail(item) {
      item.showDetail = !item.showDetail;
    }

    function handleLoadig(loading) {
      state.loading = loading;
    }
    return { talonAddress, ...toRefs(state), toggleDetail, handleLoadig };
  }
});
</script>

<style lang="scss">
.liquidity {
  overflow: hidden;
  max-width: 470px;
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
