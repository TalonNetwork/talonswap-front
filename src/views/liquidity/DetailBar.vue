<template>
  <div class="detail-bar">
    <el-input
      placeholder=""
      :value="quitNumber"
      @input="handleInput"
    ></el-input>
    <div class="rate">
      <span
        class="click"
        v-for="item in rates"
        :key="item"
        @click="getNumber(item)"
      >
        {{ item }}%
      </span>
    </div>
    <div class="confirm-wrap">
      <el-button @click="quit">{{ $t("liquidity.liquidity6") }}</el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { Times, timesDecimals } from "@/api/util";
import nerve from "nerve-sdk-js";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { NTransfer } from "@/api/api";
import { useStore } from "vuex";
import { calMinAmountOnSwapRemoveLiquidity } from "@/model";

export default defineComponent({
  props: {
    info: Object,
    talonAddress: String
  },
  setup(props, context) {
    const { t } = useI18n();
    const store = useStore();
    const rates = ref([25, 50, 75, 100]);
    const quitNumber = ref("");
    function handleInput(val) {
      const patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
      if (patrn.exec(val) || val === "") {
        quitNumber.value = val;
      }
    }

    function getNumber(item) {
      console.log(props.info, 444);
      quitNumber.value = Times(props.info.amount, item / 100).toFixed();
    }
    async function quit() {
      if (!Number(quitNumber.value)) return;
      try {
        context.emit("loading", true);
        const fromAddress = props.talonAddress;
        const toAddress = props.talonAddress;
        const LP = props.info.lpTokenAmount;
        const tokenA = props.info.token0;
        const tokenB = props.info.token1;
        const removeAmount = timesDecimals(
          quitNumber.value,
          LP.token.decimals
        ).split(".")[0];
        // 移除的资产LP的数量
        const tokenAmountLP = nerve.swap.tokenAmount(
          LP.token.assetChainId,
          LP.token.assetId,
          removeAmount
        );
        const minRemove = await calMinAmountOnSwapRemoveLiquidity({
          amountLP: removeAmount, //LP.amount,
          tokenAStr: tokenA.assetChainId + "-" + tokenA.assetId,
          tokenBStr: tokenB.assetChainId + "-" + tokenB.assetId
        });
        if (!minRemove) {
          throw "Cal min removeAmount failed";
        }
        // 资产A最小移除值
        const tokenAmountAMin = nerve.swap.tokenAmount(
          tokenA.assetChainId,
          tokenA.assetId,
          minRemove.amountAMin
        );
        // 资产B最小移除值
        const tokenAmountBMin = nerve.swap.tokenAmount(
          tokenB.assetChainId,
          tokenB.assetId,
          minRemove.amountBMin
        );
        const deadline = nerve.swap.currentTime() + 300;
        const tx = await nerve.swap.swapRemoveLiquidity(
          fromAddress,
          tokenAmountLP,
          tokenAmountAMin,
          tokenAmountBMin,
          deadline,
          toAddress,
          ""
        );
        const res = await handleHex(tx.hex);
        if (res && res.hash) {
          quitNumber.value = "";
          ElMessage.success({
            message: t("transfer.transfer14"),
            type: "success"
          });
        } else {
          ElMessage.warning({
            message: "Remove liquidity Failed",
            type: "warning"
          });
        }
      } catch (e) {
        console.log(e, "Remove-liquidity-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
      context.emit("loading", false);
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
    return {
      rates,
      quitNumber,
      handleInput,
      getNumber,
      quit
    };
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
