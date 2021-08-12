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
      @toggleExpand="toggleExpand"
      @selectAsset="selectAsset"
      @updateRate="updateRate"
    ></swap>
  </div>
</template>

<script>
import { defineComponent, onMounted, computed, reactive, toRefs } from "vue";
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
      showOverview: false,
      assetsList: [],
      swapRate: "",
      swapSymbol: [],
      orderList: [],
      orderLoading: true
    });
    function toggleExpand() {
      state.showOverview = !state.showOverview;
    }

    const talonAddress = computed(() => store.getters.talonAddress);
    onMounted(async () => {
      state.assetsList = await getAssetList(talonAddress.value);
    });

    async function selectAsset(fromAsset, toAsset) {
      if (!talonAddress.value) return;
      console.log(fromAsset, 112233, toAsset);
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

    function updateRate(rate) {
      state.swapRate = rate;
    }

    return {
      ...toRefs(state),
      toggleExpand,
      selectAsset,
      updateRate
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
