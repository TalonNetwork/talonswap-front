<template>
  <div class="swap pd_40_rd_20">
    <div class="icon-wrap flex-between">
      <div class="left click" @click="toggleExpand">
        <i class="iconfont icon-zhankai"></i>
      </div>
      <div class="right flex-center">
        <span><i class="iconfont icon-shuaxin"></i></span>
        <span><i class="iconfont icon-fenxiang"></i></span>
        <span @click="toggleSettingDialog">
          <i class="iconfont icon-shezhi"></i>
        </span>
      </div>
    </div>
    <div class="swap-area">
      <div class="from-symbol">
        <custom-input
          v-model:inputVal="fromAmount"
          :label="$t('trading.trading4')"
          :icon="fromAsset.symbol"
          :assetList="assetsList"
          :balance="fromAsset.available"
          :errorTip="fromAmountError"
          @selectAsset="asset => selectAsset(asset, 'from')"
          @max="max('from')"
        ></custom-input>
      </div>
      <div class="change-direction">
        <img src="../../assets/img/swap-to.svg" alt="" />
        <span></span>
      </div>
      <div class="to-symbol">
        <custom-input
          v-model:inputVal="toAmount"
          :label="$t('trading.trading3')"
          :icon="toAsset.symbol"
          :assetList="assetsList"
          :balance="toAsset.available"
          :errorTip="toAmountError"
          @selectAsset="asset => selectAsset(asset, 'to')"
          @max="max('to')"
        ></custom-input>
      </div>
      <div class="exchange-rate" v-if="swapRate">
        <!-- 1 BNB ≈ 2347.38 USDT -->
        {{ swapRate }}
        <i class="iconfont icon-qiehuan" @click="toggleDirection"></i>
      </div>
      <div class="confirm-wrap">
        <el-button type="primary">{{ $t("public.public10") }}</el-button>
      </div>
    </div>
    <div class="swap-setting-info">
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading6") }}</div>
        <div class="right">3%</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading7") }}</div>
        <div class="right">0.03%</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading8") }}</div>
        <div class="right">46485.47 USDT</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading9") }}</div>
        <div class="right">0.00012 ETH</div>
      </div>
    </div>
    <div class="swap-route">
      <div class="name">{{ $t("trading.trading10") }}</div>
      <div class="route-network flex-center">
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">BNB</span>
          <span>&gt;</span>
        </div>
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">BUSD</span>
          <span>&gt;</span>
        </div>
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">USDT</span>
        </div>
      </div>
    </div>
    <el-dialog
      :title="$t('trading.trading11')"
      custom-class="swap-setting"
      :show-close="false"
      width="470px"
      v-model="settingDialog"
    >
      <div class="content">
        <div class="set-item">
          <div class="name">{{ $t("trading.trading12") }}</div>
          <div class="protect flex-center">
            <span class="number">0.5%</span>
            <span class="number active">1%</span>
            <span class="number">3%</span>
            <el-input />
            %
          </div>
        </div>
        <div class="set-item">
          <div class="name">{{ $t("trading.trading13") }}</div>
          <div class="minute flex-center">
            <el-input />
            {{ $t("trading.trading14") }}
          </div>
        </div>
        <div class="bottom">
          <el-button @click="toggleSettingDialog">
            {{ $t("public.public8") }}
          </el-button>
          <el-button type="primary" @click="toggleSettingDialog">
            {{ $t("public.public9") }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, toRefs, watch, computed } from "vue";
import CustomInput from "@/components/CustomInput.vue";
import { Minus, Division, fixNumber } from "@/api/util";
import { useI18n } from "vue-i18n";
import { getAssetPrice } from "@/model";
export default defineComponent({
  name: "swap",
  components: {
    CustomInput
  },
  props: {
    assetsList: Array
  },
  setup(props, context) {
    const { t } = useI18n();
    const state = reactive({
      fromAmount: "",
      toAmount: "",
      fromAsset: {},
      toAsset: {},
      fromAmountError: "",
      toAmountError: ""
    });

    function selectAsset(asset, type) {
      // console.log(asset, type, 9999);
      if (type === "from") {
        state.fromAsset = asset;
        state.fromAmount = "";
        if (state.fromAsset.assetKey === state.toAsset.assetKey) {
          state.toAsset = {};
        }
      } else {
        state.toAsset = asset;
        state.toAmount = "";
        if (state.toAsset.assetKey === state.fromAsset.assetKey) {
          state.fromAsset = {};
        }
      }
    }

    watch(
      () => state.fromAmount,
      () => checkAmount("from")
    );
    watch(
      () => state.toAmount,
      () => checkAmount("to")
    );
    // 验证数量
    function checkAmount(type) {
      let amount, asset, amountErrorTip;
      if (type === "from") {
        amount = state.fromAmount;
        asset = state.fromAsset;
      } else {
        amount = state.toAmount;
        asset = state.toAsset;
      }
      if (amount) {
        let decimals = asset.decimals || 0;
        let patrn = "";
        if (!decimals) {
          patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
        } else {
          patrn = new RegExp(
            "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
          );
        }
        if (!patrn.exec(amount)) {
          amountErrorTip = t("transfer.transfer17") + decimals;
        } else if (
          !Number(asset.available) ||
          Minus(asset.available, amount) < 0
        ) {
          amountErrorTip = t("transfer.transfer15");
        } else {
          amountErrorTip = "";
        }
      }
      if (type === "from") {
        state.fromAmountError = amountErrorTip;
      } else {
        state.toAmountError = amountErrorTip;
      }
    }

    function max(type) {
      if (type === "from") {
        state.fromAmount = state.fromAsset.available;
      } else {
        state.fromAmount = state.toAsset.available;
      }
    }

    const swapPair = computed(() => {
      if (!state.fromAsset.assetKey || !state.toAsset.assetKey) {
        return null;
      }
      return [state.fromAsset.assetKey, state.toAsset.assetKey];
    });

    watch(
      () => swapPair.value,
      val => {
        if (val) getSwapRate();
      }
    );

    let fromPrice = "",
      toPrice = "";
    const swapRate = ref(""); // swap兑换比例
    const swapDirection = ref(""); // 比例方向
    async function getSwapRate() {
      fromPrice = "";
      toPrice = "";
      const fromInfo = swapPair.value[0].split("-");
      const toInfo = swapPair.value[1].split("-");
      fromPrice = await getAssetPrice(...fromInfo);
      toPrice = await getAssetPrice(...toInfo);
      // console.log(fromPrice, toPrice, 6633);
      swapDirection.value = "from-to";
    }
    function toggleDirection() {
      swapDirection.value =
        swapDirection.value === "from-to" ? "to-from" : "from-to";
    }
    watch(
      () => swapDirection.value,
      val => {
        if (val === "from-to") {
          swapRate.value = `1 ${state.fromAsset.symbol} ≈ ${fixNumber(
            Division(fromPrice, toPrice).toString(),
            8
          )} ${state.toAsset.symbol}`;
        } else {
          swapRate.value = `1 ${state.toAsset.symbol} ≈ ${fixNumber(
            Division(toPrice, fromPrice).toString(),
            8
          )} ${state.fromAsset.symbol}`;
        }
      }
    );

    const settingDialog = ref(false);
    function toggleExpand() {
      context.emit("toggleExpand");
    }
    function toggleSettingDialog() {
      settingDialog.value = !settingDialog.value;
    }

    return {
      ...toRefs(state),
      selectAsset,
      max,
      swapRate,
      swapDirection,
      toggleDirection,
      settingDialog,
      toggleExpand,
      toggleSettingDialog
    };
  }
});
</script>

<style lang="scss" scoped>
.swap {
  width: 470px;
  height: 752px;
  padding-bottom: 30px;
  .icon-wrap {
    .left {
      width: 27px;
      height: 25px;
      i {
        font-size: 22px;
      }
    }
    .right {
      span {
        margin-left: 15px;
        cursor: pointer;
        i {
          font-size: 22px;
        }
      }
    }
  }
  .from-symbol {
    margin-top: 18px;
  }
  .change-direction {
    margin: 12px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .exchange-rate {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    i {
      font-size: 16px;
      margin: 3px 0 0 5px;
      cursor: pointer;
      color: #4a5ef2;
    }
  }
  .swap-setting-info {
    border-top: 1px solid #e3eeff;
    border-bottom: 1px solid #e3eeff;
    margin-top: 40px;
    padding: 18px 0;
    .info-item {
      margin-bottom: 18px;
      &:last-child {
        margin-bottom: 0;
      }
      * {
        line-height: 1;
      }
      .left {
        color: #7e87c2;
      }
    }
  }
  .swap-route {
    .name {
      padding: 18px 0;
      color: #7e87c2;
    }
    .route-item {
      display: flex;
      align-items: center;
      flex: 1;
      .img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: red;
      }
      .symbol {
        margin: 0 10px;
      }
    }
  }
  .swap-setting {
    .content {
      .set-item {
        margin-bottom: 40px;
      }
      .name {
        margin-bottom: 10px;
      }
      .protect {
        .number {
          width: 70px;
          height: 44px;
          line-height: 44px;
          text-align: center;
          color: #4a5ef2;
          background-color: #e4e7ff;
          margin-right: 20px;
          border-radius: 15px;
          &.active {
            color: #fff;
            background-color: #4a5ef2;
          }
        }
      }
      :deep(.el-input) {
        width: 100px;
        margin-right: 3px;
        .el-input__inner {
          border-radius: 10px;
        }
      }
      .bottom {
        padding: 0 0 20px;
        :deep(.el-button) {
          width: 185px;
          height: 48px;
          border-radius: 15px;
          &:first-child {
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
