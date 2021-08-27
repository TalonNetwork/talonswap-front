<template>
  <div class="w1300 trading-page">
    <overview
      v-if="showOverview"
      :swapSymbol="swapSymbol"
      :swapRate="swapRate"
      :list="orderList"
      :loading="orderLoading"
    ></overview>
    <swap
      :assetsList="assetsList"
      :defaultAsset="defaultAsset"
      @toggleExpand="toggleExpand"
      @selectAsset="selectAsset"
      @updateRate="updateRate"
      @updateOrderList="updateOrderList"
    ></swap>
  </div>
</template>

<script>
import {
  defineComponent,
  onMounted,
  computed,
  reactive,
  toRefs,
  onBeforeUnmount,
  watch
} from "vue";
import Overview from "./Overview.vue";
import Swap from "./Swap.vue";
import { useStore } from "vuex";
import { getAssetList, userTradeHistoryPage } from "@/model";
import nerve from "nerve-sdk-js";
import config from "@/config";
import { divisionDecimals } from "@/api/util";
import dayjs from "dayjs";

export default defineComponent({
  name: "trading",
  components: {
    Overview,
    Swap
  },
  props: {},
  setup() {
    const store = useStore();
    const state = reactive({
      showOverview: localStorage.getItem("showOverview") === "true",
      assetsList: [],
      swapRate: "",
      swapSymbol: [],
      orderList: [],
      orderLoading: false,
      defaultAsset: null, // 默认选择的资产
      orderTotal: 0
    });
    function toggleExpand() {
      state.showOverview = !state.showOverview;
      localStorage.setItem("showOverview", state.showOverview);
    }

    const talonAddress = computed(() => store.getters.talonAddress);
    let timer;
    onMounted(async () => {
      state.assetsList = await getAssetList(talonAddress.value);
      state.defaultAsset = state.assetsList.find(item => item.symbol === "NVT");
      timer = setInterval(async () => {
        state.assetsList = await getAssetList(talonAddress.value);
      }, 10000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      clearInterval(timer1);
    });

    async function selectAsset(fromAsset, toAsset) {
      if (!talonAddress.value || !fromAsset || !toAsset) return;
      state.swapSymbol = [fromAsset.symbol, toAsset.symbol];
      const fromToken = nerve.swap.token(fromAsset.chainId, fromAsset.assetId);
      const toToken = nerve.swap.token(toAsset.chainId, toAsset.assetId);
      const pairAddress = nerve.swap.getStringPairAddress(
        config.chainId,
        fromToken,
        toToken
      );
      const data = {
        pairAddress,
        userAddress: talonAddress.value
      };
      state.orderLoading = true;
      const res = await userTradeHistoryPage(data);
      state.orderLoading = false;
      if (res) {
        state.orderTotal = res.total || 0;
        const list = [];
        res.list.map(v => {
          const fromToken = v.paidTokenAmount.token;
          const fromAmount = v.paidTokenAmount.amount;
          const toToken = v.receivedTokenAmount.token;
          const toAmount = v.receivedTokenAmount.amount;
          list.push({
            time: dayjs(v.txTime * 1000).format("MM-DD HH:mm"),
            fromAmount: divisionDecimals(fromAmount, fromToken.decimals),
            fromSymbol: fromToken.symbol,
            toAmount: divisionDecimals(toAmount, toToken.decimals),
            toSymbol: toToken.symbol,
            status: true
          });
        });
        state.orderList = list;
        console.log(list, 44444);
      }
    }
    // eslint-disable-next-line no-redeclare
    let timer1;
    async function updateOrderList(fromAsset, toAsset) {
      if (timer1) clearInterval(timer1);
      timer1 = null;
      await selectAsset(fromAsset, toAsset);
      timer1 = setInterval(async () => {
        await selectAsset(fromAsset, toAsset);
      }, 5000);
      state.assetsList = await getAssetList(talonAddress.value);
      // state.defaultAsset = state.assetsList.find(item => item.symbol === "NVT");
    }

    function updateRate(rate) {
      state.swapRate = rate;
    }

    watch(
      () => state.orderTotal,
      (newVal, oldVal) => {
        console.log(newVal, oldVal);
        if (newVal !== oldVal) {
          if (timer1) clearInterval(timer1);
          timer1 = null;
        }
      },
      {
        deep: true
      }
    );

    return {
      ...toRefs(state),
      toggleExpand,
      selectAsset,
      updateRate,
      updateOrderList
    };
  }
});
</script>

<style lang="scss">
.trading-page {
  display: flex;
  justify-content: center;
}
</style>
