<template>
  <div class="farm-details">
    <div class="getLp">
      <p class="click">
        {{ $t("farm.farm7") }}NULS-ETH LP
        <i class=""></i>
      </p>
      <p class="click">
        {{ $t("farm.farm8") }}
        <i class=""></i>
      </p>
    </div>
    <div class="biaoge">
      <div class="gain">
        <div class="left">
          <div class="info-title">
            {{ tokenInfo.syrupTokenSymbol }}{{ $t("farm.farm2") }}
          </div>
          <p>{{ tokenInfo.pendingReward }}</p>
          <span>≈${{ tokenInfo.pendingRewardUSD }}</span>
        </div>
        <div class="right">
          <el-button class="btns" type="primary" size="small" @click="gether">
            {{ $t("farm.farm21") }}
          </el-button>
        </div>
      </div>
      <div class="alter">
        <div class="left">
          <div class="info-title">{{ $t("farm.farm9") }}LP</div>
          <p>{{ tokenInfo.stakeAmount }}</p>
          <span>≈${{ tokenInfo.stakeUSD }}</span>
        </div>
        <div class="right">
          <template v-if="needAuth">
            <el-button
              class="btns auth-btn"
              type="primary"
              size="small"
              @click="authToken"
            >
              {{ $t("transfer.transfer13") }}
            </el-button>
          </template>
          <template v-else>
            <el-button
              class="btns"
              type="primary"
              size="small"
              icon="el-icon-minus"
              @click="handleLP('minus')"
            ></el-button>
            <el-button
              class="btns"
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="handleLP('add')"
            ></el-button>
          </template>
        </div>
      </div>
    </div>
    <el-dialog
      title=""
      center
      width="470px"
      custom-class="add-minus-dialog"
      v-model="dialogAddOrMinus"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div
        v-loading="loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <div class="titles">
          {{ addOrMinus === "add" ? $t("farm.farm20") : $t("farm.farm10") }}LP
        </div>
        <div class="infos">
          <div class="in flex-between">
            <span>
              {{
                addOrMinus === "add" ? $t("farm.farm20") : $t("farm.farm10")
              }}LP
            </span>
            <label>
              {{ $t("public.public16") }}{{ tokenInfo.stakeAmount }}
            </label>
          </div>
          <div class="clear"></div>
          <div class="to">
            <el-input class="no-border" v-model="numberValue" placeholder="0.0">
              <template #append><span @click="clickMax">Max</span></template>
            </el-input>
            <!-- <el-input v-model="numberValue" class="fl" placeholder="0"></el-input>
          <span class="fl click max" @click="clickMax">Max</span> -->
            <span class="fr lp">{{ tokenInfo.name }}</span>
          </div>
        </div>
        <div class="dialog-footer">
          <el-button @click="dialogAddOrMinus = false">
            {{ $t("public.public8") }}
          </el-button>
          <el-button type="primary" @click="confirmAddOrMinus">
            {{ $t("public.public9") }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from "vue";
import config from "@/config";
import nerve from "nerve-sdk-js";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { ETransfer, NTransfer } from "@/api/api";
import { timesDecimals } from "@/api/util";
import { contractAddress } from "@/hooks/farm/contractConfig";

nerve.customnet(config.chainId, config.API_URL, config.timeout); // sdk设置测试网chainId
export default defineComponent({
  name: "details-bar",
  props: {
    tokenInfo: {
      type: Object,
      default: () => {}
    },
    showId: {
      type: Boolean,
      default: false
    },
    isTalon: Boolean
  },
  setup(props, { emit }) {
    const store = useStore();
    const { t } = useI18n();
    const dialogAddOrMinus = ref(false);
    const addOrMinus = ref("add");
    const numberValue = ref("");
    const loading = ref(false);
    const needAuth = ref(true);
    const refreshAuth = ref(false);
    onMounted(async () => {
      getERC20Allowance();
    });
    async function getERC20Allowance() {
      if (props.isTalon) {
        needAuth.value = false;
      } else {
        const transfer = new ETransfer();
        const addressInfo = store.state.addressInfo;
        needAuth.value = await transfer.getERC20Allowance(
          props.tokenInfo.lpToken,
          contractAddress,
          addressInfo.address.Ethereum
        );
        if (!needAuth.value) {
          refreshAuth.value = false;
        }
        if (refreshAuth.value) {
          setTimeout(() => {
            getERC20Allowance();
          }, 5000);
        }
      }
    }

    async function authToken() {
      emit("loading", true);
      try {
        const transfer = new ETransfer();
        const res = await transfer.approveERC20(
          props.tokenInfo.lpToken,
          contractAddress,
          store.state.addressInfo.address.Ethereum
        );
        handleMsg(res);
        refreshAuth.value = true;
        getERC20Allowance();
      } catch (e) {
        ElMessage.warning({
          message: e,
          type: "warning"
        });
      }
      emit("loading", false);
    }

    function handleMsg(data) {
      // console.log(data, 555);
      if (data.success) {
        ElMessage.success({
          message: t("transfer.transfer14"),
          type: "success"
        });
      } else {
        ElMessage.warning({ message: data.msg, type: "warning" });
      }
    }

    async function gether() {
      emit("loading", true);
      await farmStake(0);
      emit("loading", false);
    }
    // 收取收益 / 增加LP
    async function farmStake(number) {
      //console.log(tokenInfo);
      // emit("charge", tokenInfo);
      // LPOperation(props.tokenInfo.pendingReward, 2);
      try {
        const addressInfo = store.state.addressInfo;
        const {
          stakeTokenChainId,
          stakeTokenAssetId,
          stakeTokenDecimals,
          farmHash
        } = props.tokenInfo;
        const ammount = timesDecimals(number, stakeTokenDecimals);
        const tx = await nerve.swap.farmStake(
          addressInfo.address.Talon,
          nerve.swap.token(stakeTokenChainId, stakeTokenAssetId),
          config.chainId,
          config.prefix,
          ammount,
          farmHash,
          ""
        );
        await handleHex(tx.hex);
      } catch (e) {
        console.log(e, "gain-profit-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
    }

    function handleLP(type) {
      if (type === "add") {
        dialogAddOrMinus.value = true;
        addOrMinus.value = "add";
      } else {
        dialogAddOrMinus.value = true;
        addOrMinus.value = "minus";
      }
    }

    function clickMax() {
      numberValue.value = props.tokenInfo.stakeAmount;
    }
    async function confirmAddOrMinus() {
      if (addOrMinus.value === "add") {
        loading.value = true;
        await farmStake(numberValue.value);
        loading.value = false;
      } else {
        // farmWithdraw
        loading.value = true;
        await farmWithdrawal(numberValue.value);
        loading.value = false;
        // LPOperation(numberValue.value, 1);
      }
    }

    // 退出质押
    async function farmWithdrawal(number) {
      try {
        const addressInfo = store.state.addressInfo;
        const {
          stakeTokenChainId,
          stakeTokenAssetId,
          stakeTokenDecimals,
          farmHash
        } = props.tokenInfo;
        const ammount = timesDecimals(number, stakeTokenDecimals);
        const tx = await nerve.swap.farmWithdraw(
          addressInfo.address.Talon,
          nerve.swap.token(stakeTokenChainId, stakeTokenAssetId),
          // config.chainId,
          // config.prefix,
          ammount,
          farmHash,
          ""
        );
        await handleHex(tx.hex);
      } catch (e) {
        console.log(e, "gain-profit-error");
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
    }

    // 添加 - 0、减少 - 1 lp, 领取收益 -2
    function LPOperation(number, type) {}

    async function handleHex(hex) {
      const tAssemble = nerve.deserializationTx(hex);

      const transfer = new NTransfer({ chain: "NERVE" });
      const addressInfo = store.state.addressInfo;
      const txHex = await transfer.getTxHex({
        tAssemble,
        pub: addressInfo.pub,
        signAddress: addressInfo.address.Ethereum
      });
      console.log(txHex, 666);
      const result = await transfer.broadcastHex(txHex);
      if (result && result.hash) {
        dialogAddOrMinus.value = false;
        ElMessage.success({
          message: t("transfer.transfer14"),
          type: "success"
        });
      } else {
        ElMessage.warning({
          message: "Failed",
          type: "warning"
        });
      }
    }
    return {
      needAuth,
      authToken,
      dialogAddOrMinus,
      addOrMinus,
      numberValue,
      loading,
      gether,
      handleLP,
      clickMax,
      confirmAddOrMinus
    };
  }
});
</script>

<style lang="scss">
.farm-details {
  /* height: 148px; */
  padding: 20px 60px 20px 40px;
  background: #fafcff;
  border-bottom: 1px solid #e4efff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .getLp {
    min-width: 200px;
    p {
      font-size: 16px;
      font-weight: 500;
      color: #4a5ef2;
      line-height: 24px;
      margin-top: 8px;
      &:first-child {
        margin: 0;
      }
    }
  }
  .biaoge {
    flex: 1;
    display: flex;
    .gain,
    .alter {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-left: 60px;
      height: 108px;
      padding: 20px 40px;
      background: #fff;
      border: 1px solid #e4efff;
      border-radius: 10px;
      .left {
        .info-title {
          font-size: 14px;
          margin-bottom: 5px;
        }
        p {
          font-size: 20px;
          font-weight: bold;
        }
        span {
          font-size: 14px;
          font-weight: bold;
          color: #858fb1;
        }
      }
      .btns {
        width: 100px;
        height: 38px;
        background: #4a5ef2;
        border-radius: 6px;
      }
    }
    .alter {
      .btns {
        width: 70px;
        margin-left: 20px;
        &.auth-btn {
          width: 100px;
        }
        i {
          font-size: 20px;
        }
      }
    }
  }
  .el-overlay {
    z-index: 1888 !important;
  }
}
.add-minus-dialog {
  border-radius: 10px;
  .el-dialog__header {
    padding: 0;
  }
  .el-dialog__body {
    .titles {
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
      text-align: center;
      margin: 0 0 20px 20px;
    }
    .infos {
      width: 417px;
      height: 94px;
      padding: 15px 20px;
      background: #ffffff;
      border: 1px solid #e3eeff;
      border-radius: 15px;
      .in {
        font-size: 14px;
        font-weight: 500;
        color: #7e87c2;
        margin-bottom: 4px;
      }
      .to {
        display: flex;
        align-items: center;
        .el-input {
          flex: 1;
          .el-input__inner {
            font-size: 20px;
            /* border: transparent;
            height: 30px;
            line-height: 30px; */
          }
        }
        .el-input-group__append,
        .el-input-group__prepend {
          background-color: transparent;
          border: none;
          padding-right: 0;
          span {
            display: inline-block;
            padding: 3px 6px;
            color: #4b7cf7;
            background-color: #e4e7ff;
            cursor: pointer;
            border-radius: 5px;
          }
        }
        .lp {
          min-width: 100px;
          font-size: 14px;
          font-weight: 600;
          text-align: right;
        }
      }
    }
  }

  .dialog-footer {
    padding: 40px 0 30px 0;
    .el-button {
      width: 185px;
      height: 48px;
      background: #ffffff;
      border: 1px solid #4a5ef2;
    }
    .el-button--primary {
      background: #4a5ef2;
      margin-left: 20px;
    }
  }
}
</style>
