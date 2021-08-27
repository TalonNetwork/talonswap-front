<template>
  <div
    class="add-liquidity"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <div class="head">
      <div class="back"><i class="el-icon-back" @click="back"></i></div>
      <h3>
        {{
          insufficient
            ? $t("liquidity.liquidity12")
            : $t("liquidity.liquidity7")
        }}
      </h3>
    </div>
    <div class="create-liquidity-tip" v-show="insufficient">
      {{ $t("liquidity.liquidity10") }}
    </div>
    <custom-input
      v-model:inputVal="fromAmount"
      :icon="fromAsset.symbol"
      :assetList="assetsList"
      :balance="fromAsset.available"
      :errorTip="fromAmountError"
      @selectAsset="selectAsset($event, 'from')"
      @max="max('from')"
    ></custom-input>
    <div class="add">
      <img src="../../assets/img/add-liquid.svg" alt="" />
    </div>
    <custom-input
      v-model:inputVal="toAmount"
      :icon="toAsset.symbol"
      :assetList="assetsList"
      :balance="toAsset.available"
      :errorTip="toAmountError"
      @selectAsset="asset => selectAsset(asset, 'to')"
      @max="max('to')"
    ></custom-input>
    <div class="liquidity-info" v-if="priceInfo">
      <div class="name">{{ $t("liquidity.liquidity8") }}</div>
      <div class="content">
        <div class="flex1">
          <div>{{ priceInfo.from_to }}</div>
          <p>{{ toAsset.symbol }} Per {{ fromAsset.symbol }}</p>
        </div>
        <div class="flex1">
          <div>{{ priceInfo.to_from }}</div>
          <p>{{ fromAsset.symbol }} Per {{ toAsset.symbol }}</p>
        </div>
        <div class="flex1">
          <div>{{ priceInfo.share }}%</div>
          <p>{{ $t("liquidity.liquidity11") }}</p>
        </div>
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button
        type="primary"
        v-if="insufficient"
        @click="createPair"
        :disabled="disableCreate"
      >
        {{ $t("liquidity.liquidity13") }}
      </el-button>
      <el-button
        type="primary"
        v-else
        @click="addLiquidity"
        :disabled="disableAdd || !!fromAmountError"
      >
        {{ fromAmountError || $t("liquidity.liquidity9") }}
      </el-button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  watch,
  nextTick,
  computed,
  onBeforeUnmount
} from "vue";
import CustomInput from "@/components/CustomInput.vue";
import {
  Minus,
  Division,
  fixNumber,
  timesDecimals,
  parseChainInfo,
  divisionAndFix,
  Times,
  divisionDecimals,
  tofix,
  Plus
} from "@/api/util";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { getSwapPairInfo, calMinAmountOnSwapAddLiquidity } from "@/model";
import nerve from "nerve-sdk-js";
import { NTransfer } from "@/api/api";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "addLiquidity",
  props: {
    assetsList: Array,
    talonAddress: String
  },
  components: {
    CustomInput
  },
  setup(props, context) {
    const { t } = useI18n();
    const store = useStore();
    const state = reactive({
      feeRate: 0.3, // 千三的手续费
      storedSwapPairInfo: {}, // 缓存的swapPairInfo
      fromAmount: "",
      toAmount: "",
      fromAsset: {},
      toAsset: {},
      fromAmountError: "",
      toAmountError: "",
      disableWatchFromAmount: false, // 停止监听fromAmount
      disableWatchToAmount: false, // 停止监听toAmount
      insufficient: false, // 流动性不足
      loading: false,
      disableCreate: false
    });

    function selectAsset(asset, type) {
      // console.log(asset, type, 9999);
      state.fromAmount = "";
      state.toAmount = "";
      if (type === "from") {
        state.fromAsset = asset;
        if (state.fromAsset.assetKey === state.toAsset.assetKey) {
          state.toAsset = {};
        }
      } else {
        state.toAsset = asset;
        if (state.fromAsset.assetKey === state.toAsset.assetKey) {
          state.fromAsset = {};
        }
      }

      state.insufficient = false;

      // getSwapRate(true);
      if (state.fromAsset.assetKey && state.toAsset.assetKey) {
        // context.emit("selectAsset", state.fromAsset, state.toAsset);
      }
      storeSwapPairInfo();
    }

    async function storeSwapPairInfo(refreshKey) {
      const fromAssetKey = state.fromAsset.assetKey;
      const toAssetKey = state.toAsset.assetKey;
      const key = refreshKey ? refreshKey : fromAssetKey + "_" + toAssetKey;
      console.log(key, refreshKey, 969696333);
      if (fromAssetKey && toAssetKey) {
        if (state.storedSwapPairInfo[key] && !refreshKey) {
          // 如果存在切不需要刷新 则跳过
        } else {
          const result = await getSwapPairInfo({
            tokenAStr: fromAssetKey,
            tokenBStr: toAssetKey
          });
          if (result) {
            const token0Key =
              result.token0.assetChainId + "-" + result.token0.assetId;
            state.storedSwapPairInfo[key] = {
              reserveFrom:
                token0Key === fromAssetKey ? result.reserve0 : result.reserve1, // fromAsset的池子余额
              reserveTo:
                token0Key === fromAssetKey ? result.reserve1 : result.reserve0 // // toAsset的池子余额
            };
            state.insufficient = false;
          } else {
            state.insufficient = true;
          }
        }
      }
    }

    function max(type) {
      if (type === "from") {
        state.fromAmount = state.fromAsset.available;
      } else {
        state.toAmount = state.toAsset.available;
      }
    }

    // 监听fromAmount变化
    watch(
      () => state.fromAmount,
      async val => {
        if (val) {
          if (
            !Number(state.fromAsset.available) ||
            Minus(state.fromAsset.available, val) < 0
          ) {
            state.fromAmountError = t("transfer.transfer15");
          } else {
            state.fromAmountError = "";
          }
          if (state.insufficient) return;
          if (!state.disableWatchFromAmount) {
            const res = getLiquidAmount(val, "to"); // 通过from计算to
            if (res) {
              state.disableWatchToAmount = true; // 避免进入无限循环计算
              state.toAmount = res;
              // getSwapRate();
              await nextTick();
              state.disableWatchToAmount = false;
            } else {
              // getSwapRate(true);
            }
          }
        } else {
          state.toAmount = "";
          state.fromAmountError = "";
          // getSwapRate(true);
        }
      }
    );
    watch(
      () => state.toAmount,
      async val => {
        if (val) {
          if (
            !Number(state.toAsset.available) ||
            Minus(state.toAsset.available, val) < 0
          ) {
            state.toAmountError = t("transfer.transfer15");
          } else {
            state.toAmountError = "";
          }
          if (state.insufficient) return;
          if (!state.disableWatchToAmount) {
            const res = getLiquidAmount(val, "from"); // 通过to计算from
            if (res) {
              state.disableWatchFromAmount = true;
              state.fromAmount = res;
              // getSwapRate();
              await nextTick();
              state.disableWatchFromAmount = false;
            } else {
              // getSwapRate(true);
            }
          }
        } else {
          state.fromAmount = "";
          state.fromAmountError = "";
          // getSwapRate(true);
        }
      }
    );

    // 计算需添加的数量 type- 计算from/to的数量
    function getLiquidAmount(amount, type) {
      const fromAssetKey = state.fromAsset.assetKey;
      const toAssetKey = state.toAsset.assetKey;
      if (fromAssetKey && toAssetKey && !isNaN(amount) && amount > 0) {
        const fromDecimal =
          type === "from" ? state.toAsset.decimals : state.fromAsset.decimals;
        const toDecimal =
          type === "from" ? state.fromAsset.decimals : state.toAsset.decimals;
        amount = timesDecimals(amount, fromDecimal);
        const key = fromAssetKey + "_" + toAssetKey;
        const info = state.storedSwapPairInfo[key];
        if (!info) {
          // setTimeout(() => {
          //   getLiquidAmount(amount, type);
          // }, 200);
          return;
        } else {
          const reserveA = type === "from" ? info.reserveTo : info.reserveFrom;
          const reserveB = type === "from" ? info.reserveFrom : info.reserveTo;
          const res = nerve.swap.quote(amount, reserveA, reserveB); // from,reverseFrom,reverseTo / to,reverseTo,reverseFrom
          return divisionAndFix(res.toString(), toDecimal, toDecimal);
        }
      }
    }

    const priceInfo = computed(() => {
      const {
        fromAmount,
        toAmount,
        fromAsset: { assetKey: fromKey },
        toAsset: { assetKey: toKey },
        storedSwapPairInfo
      } = state;
      if (!fromKey || !toKey) {
        return null;
      } else {
        const info = storedSwapPairInfo[fromKey + "_" + toKey];
        // console.log(info, 666);
        if (!info || info.reserveFrom == 0 || info.reserveTo == 0) {
          // 创建交易对
          let from_to = "-";
          let to_from = "-";
          let share = 0;
          console.log(Division(fromAmount, toAmount).toFixed(), 798798);
          if (fromAmount && toAmount) {
            from_to = fixNumber(
              Division(fromAmount, toAmount).toFixed(),
              state.toAsset.decimals
            );
            to_from = fixNumber(
              Division(toAmount, fromAmount).toFixed(),
              state.fromAsset.decimals
            );
            share = 100;
          }
          return {
            from_to,
            to_from,
            share
          };
        } else {
          // 添加流动性
          const from_to = fixNumber(
            Division(info.reserveTo, info.reserveFrom).toFixed(),
            state.toAsset.decimals
          );
          const to_from = fixNumber(
            Division(info.reserveFrom, info.reserveTo).toFixed(),
            state.fromAsset.decimals
          );
          let share = 0;
          if (fromAmount && toAmount) {
            const allReserveFrom = Plus(
              timesDecimals(fromAmount, state.fromAsset.decimals),
              info.reserveFrom
            );
            share = fixNumber(
              Division(
                timesDecimals(fromAmount, state.fromAsset.decimals),
                allReserveFrom
              ).toFixed(),
              4
            );
            share =
              Minus(share, 0.0001) > 0
                ? tofix(Times(share, 100), 2, 1)
                : "<0.01";
            // share =
            //   Minus(share, 0.0001) > 0
            //     ? Minus(share, 100) > 0
            //       ? 100
            //       : share
            //     : "<0.01";
          }
          return {
            from_to,
            to_from,
            share
          };
        }
      }
    });

    const disableCreate = computed(() => {
      return !!(
        !state.fromAmount ||
        !state.fromAsset.symbol ||
        !state.toAmount ||
        !state.toAsset.symbol ||
        !props.talonAddress ||
        state.disableCreate
      );
    });

    const disableAdd = computed(() => {
      return !!(
        !state.fromAmount ||
        !state.fromAsset.symbol ||
        !state.toAmount ||
        !state.toAsset.symbol ||
        state.insufficient ||
        !props.talonAddress
      );
    });

    async function createPair() {
      // const { fromAsset, toAsset } = state;
      // refreshNewPair(fromAsset.assetKey, toAsset.assetKey);
      // return;
      state.loading = true;
      try {
        const { fromAsset, toAsset } = state;
        const tokenA = nerve.swap.token(fromAsset.chainId, fromAsset.assetId); // 资产A的类型
        const tokenB = nerve.swap.token(toAsset.chainId, toAsset.assetId); // 资产B的类型
        const tx = await nerve.swap.swapCreatePair(
          props.talonAddress,
          tokenA,
          tokenB,
          ""
        );
        const res = await handleHex(tx.hex);
        if (res && res.hash) {
          ElMessage.success({
            message: t("liquidity.liquidity14"),
            type: "success"
          });
          refreshNewPair(fromAsset.assetKey, toAsset.assetKey);
        } else {
          ElMessage.warning({
            message: "Create Pair Failed",
            type: "warning"
          });
        }
      } catch (e) {
        console.log(e, "Create Pair-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
      state.loading = false;
    }

    let refreshPairTimer;
    // 创建流动性后刷新缓存的交易对信息，直到新创建的交易对生效
    function refreshNewPair(fromKey, toKey) {
      const key = fromKey + "_" + toKey;
      state.disableCreate = true;
      refreshPairTimer = setInterval(() => {
        if (state.storedSwapPairInfo[key]) {
          state.disableCreate = false;
          clearInterval(refreshPairTimer);
        } else {
          storeSwapPairInfo(key);
        }
      }, 2000);
    }
    onBeforeUnmount(() => {
      clearInterval(refreshPairTimer);
    });

    async function addLiquidity() {
      state.loading = true;
      try {
        const { fromAsset, toAsset, fromAmount, toAmount } = state;

        const amountA = timesDecimals(fromAmount, fromAsset.decimals);
        const amountB = timesDecimals(toAmount, toAsset.decimals);
        let { amountAMin, amountBMin } = await calMinAmountOnSwapAddLiquidity({
          amountA,
          amountB,
          tokenAStr: fromAsset.assetKey,
          tokenBStr: toAsset.assetKey
        });
        if (amountAMin == 0 || amountBMin == 0) {
          amountAMin = amountA;
          amountBMin = amountB;
        }
        const tokenAmountA = nerve.swap.tokenAmount(
          fromAsset.chainId,
          fromAsset.assetId,
          amountA
        );
        const tokenAmountB = nerve.swap.tokenAmount(
          toAsset.chainId,
          toAsset.assetId,
          amountB
        );
        const deadline = nerve.swap.currentTime() + 300; // 过期时间
        const fromAddress = props.talonAddress;
        const toAddress = props.talonAddress;
        const tx = await nerve.swap.swapAddLiquidity(
          fromAddress,
          tokenAmountA,
          tokenAmountB,
          amountAMin,
          amountBMin,
          deadline,
          toAddress,
          ""
        );
        const res = await handleHex(tx.hex);
        if (res && res.hash) {
          ElMessage.success({
            message: t("transfer.transfer14"),
            type: "success"
          });
          state.fromAmount = "";
          state.toAmount = "";
          setTimeout(() => {
            context.emit("updateList");
          }, 200);
        } else {
          ElMessage.warning({
            message: "Create Pair Failed",
            type: "warning"
          });
        }
      } catch (e) {
        console.log(e, "Create Pair-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
      state.loading = false;
    }

    const addressInfo = computed(() => {
      return store.state.addressInfo;
    });

    async function handleHex(hex) {
      const tAssemble = nerve.deserializationTx(hex);
      const transfer = new NTransfer({ chain: "NERVE" });
      const txHex = await transfer.getTxHex({
        tAssemble,
        pub: addressInfo.value?.pub,
        signAddress: addressInfo.value?.address?.Ethereum
      });
      console.log(txHex, "===txHex===");
      return await transfer.broadcastHex(txHex);
    }

    function back() {
      context.emit("update:show", false);
    }
    return {
      back,
      ...toRefs(state),
      selectAsset,
      max,
      priceInfo,
      createPair,
      addLiquidity,
      disableCreate,
      disableAdd
    };
  }
});
</script>

<style lang="scss" scoped>
.add-liquidity {
  padding: 40px;
  .head {
    position: relative;
    margin-bottom: 40px;
    h3 {
      text-align: center;
      font-size: 24px;
    }
    .back {
      position: absolute;
      top: -3px;
      left: 0;
      font-size: 30px;
      cursor: pointer;
      i {
        font-weight: 600;
      }
    }
  }
  .create-liquidity-tip {
    padding: 16px 20px;
    font-size: 14px;
    text-align: center;
    color: #4a5ef2;
    background-color: #f8f9ff;
    margin: -20px 0 20px;
    border-radius: 10px;
  }
  .add {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 12px 0;
  }
  .liquidity-info {
    margin-top: 30px;
    .name {
      color: #7e87c2;
      margin-bottom: 8px;
    }
    .content {
      border: 1px solid #e4efff;
      border-radius: 15px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      /* height: 94px; */
      padding: 15px;
      .flex1 {
        /* height: 100%; */
        /* flex: 1; */
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        div {
          font-size: 18px;
        }
        p {
          font-size: 14px;
          color: #7e87c2;
        }
      }
    }
  }
  .confirm-wrap {
    margin: 40px 0 20px;
  }
}
@media screen and (max-width: 1200px) {
  .add-liquidity {
    padding: 15px;
  }
}
</style>
