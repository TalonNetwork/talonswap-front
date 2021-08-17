<template>
  <div class="farm-details">
    <div class="getLp">
      <p class="click">
        {{ $t("farm.farm7") }}{{ tokenInfo.name }}
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
          <el-button
            class="btns"
            type="primary"
            size="small"
            @click="gether"
            :disabled="!!!Number(tokenInfo.pendingReward) || !talonAddress"
          >
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
              :disabled="!!!Number(tokenInfo.stakeAmount) || !talonAddress"
              @click="handleLP('minus')"
            ></el-button>
            <el-button
              class="btns"
              type="primary"
              size="small"
              icon="el-icon-plus"
              :disabled="
                !!!Number(tokenInfo.syrupTokenBalance) || !talonAddress
              "
              @click="handleLP('add')"
            ></el-button>
          </template>
        </div>
      </div>
    </div>
    <lp-dialog
      v-model:showLPDialog="dialogAddOrMinus"
      :loading="loading"
      :balance="balance"
      :addOrMinus="addOrMinus"
      :lpName="tokenInfo.name"
      :decimal="tokenInfo.stakeTokenDecimals"
      @confirm="confirmAddOrMinus"
    ></lp-dialog>
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
import { timesDecimals, divisionDecimals } from "@/api/util";
import { contractAddress, txAbi } from "@/hooks/farm/contractConfig";
import { ethers } from "ethers";
import { getAssetBalance } from "@/model";
import LpDialog from "@/components/LpDialog";

export default defineComponent({
  name: "details-bar",
  components: {
    LpDialog
  },
  props: {
    tokenInfo: {
      type: Object,
      default: () => {}
    },
    showId: {
      type: Boolean,
      default: false
    },
    isTalon: Boolean,
    talonAddress: String
  },
  setup(props, { emit }) {
    const store = useStore();
    const { t } = useI18n();
    const dialogAddOrMinus = ref(false);
    const addOrMinus = ref("add");
    const loading = ref(false);
    const needAuth = ref(true);
    const refreshAuth = ref(false);
    const addressInfo = computed(() => {
      return store.state.addressInfo;
    });
    const balance = ref(0);
    onMounted(async () => {
      getERC20Allowance();
    });
    async function getERC20Allowance() {
      if (props.isTalon) {
        needAuth.value = false;
      } else {
        const transfer = new ETransfer();
        needAuth.value = await transfer.getERC20Allowance(
          props.tokenInfo.lpToken,
          contractAddress,
          addressInfo.value?.address?.Ethereum
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

    // 授权token
    async function authToken() {
      emit("loading", true);
      try {
        const transfer = new ETransfer();
        const res = await transfer.approveERC20(
          props.tokenInfo.lpToken,
          contractAddress,
          addressInfo.value?.address?.Ethereum
        );
        if (res.hash) {
          ElMessage.success({
            message: t("transfer.transfer14"),
            type: "success"
          });
          refreshAuth.value = true;
          getERC20Allowance();
        } else {
          ElMessage.warning({ message: res.message || res, type: "warning" });
        }
      } catch (e) {
        ElMessage.warning({
          message: e.message || e,
          type: "warning"
        });
      }
      emit("loading", false);
    }

    async function gether() {
      emit("loading", true);
      if (props.isTalon) {
        await farmStake(0);
      } else {
        await LPOperation(2, 0);
      }
      emit("loading", false);
    }

    // 收取收益(number = 0) / 增加LP
    async function farmStake(number) {
      try {
        const {
          stakeTokenChainId,
          stakeTokenAssetId,
          stakeTokenDecimals,
          farmHash
        } = props.tokenInfo;
        const ammount = timesDecimals(number, stakeTokenDecimals);
        const tx = await nerve.swap.farmStake(
          addressInfo.value?.address?.Talon,
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

    // 添加/退出lp弹窗
    async function handleLP(type) {
      console.log(type, 9966333, props.tokenInfo);
      if (type === "add") {
        dialogAddOrMinus.value = true;
        addOrMinus.value = "add";
        getBalance();
      } else {
        dialogAddOrMinus.value = true;
        addOrMinus.value = "minus";
        balance.value = props.tokenInfo.stakeAmount;
      }
    }

    async function getBalance() {
      balance.value = "";
      if (props.isTalon) {
        const { stakeTokenChainId, stakeTokenAssetId, stakeTokenDecimals } =
          props.tokenInfo;
        const res = await getAssetBalance(
          stakeTokenChainId,
          stakeTokenAssetId,
          addressInfo.value?.address?.Talon
        );
        balance.value = divisionDecimals(res.balance, stakeTokenDecimals);
      } else {
        const transfer = new ETransfer();
        const contractAddress = props.tokenInfo.lpToken;
        const address = addressInfo.value?.address?.Ethereum;
        if (contractAddress) {
          const decimal = props.tokenInfo.stakeTokenDecimals;
          const res = await transfer.getERC20Balance(
            contractAddress,
            Number(decimal),
            address
          );
          // console.log(res);
          balance.value = res;
        } else {
          const res = await transfer.getEthBalance(address);
          balance.value = res;
        }
      }
    }

    // 添加 / 退出farm
    async function confirmAddOrMinus(amount) {
      if (addOrMinus.value === "add") {
        loading.value = true;
        if (props.isTalon) {
          await farmStake(amount);
        } else {
          await LPOperation(0, amount);
        }
        loading.value = false;
      } else {
        // farmWithdraw
        loading.value = true;
        if (props.isTalon) {
          await farmWithdrawal(amount);
        } else {
          await LPOperation(1, amount);
        }
        loading.value = false;
      }
    }

    // 退出质押
    async function farmWithdrawal(number) {
      try {
        const {
          stakeTokenChainId,
          stakeTokenAssetId,
          stakeTokenDecimals,
          farmHash
        } = props.tokenInfo;
        const ammount = timesDecimals(number, stakeTokenDecimals);
        const tx = await nerve.swap.farmWithdraw(
          addressInfo.value?.address?.Talon,
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
    async function LPOperation(type, value) {
      try {
        const transfer = new ETransfer();
        const { stakeTokenDecimals } = props.tokenInfo;
        const wallet = transfer.provider.getSigner();
        const contracts = new ethers.Contract(contractAddress, txAbi, wallet);
        let res;
        const amount = timesDecimals(value, stakeTokenDecimals);
        // console.log(amount, 9595);
        const pid = props.tokenInfo.farmHash;
        if (type === 0) {
          // console.log(props.tokenInfo.farmHash, 999888)
          res = await contracts.deposit(pid, amount);
        } else if (type === 1) {
          res = await contracts.withdraw(pid, amount);
        } else {
          res = await contracts.deposit(pid, amount);
        }
        if (res.hash) {
          ElMessage({
            message: t("transfer.transfer14"),
            type: "success"
          });
          dialogAddOrMinus.value = false;
        } else {
          ElMessage({ message: res.message || res, type: "warning" });
        }
      } catch (e) {
        ElMessage({
          message: e.message || e,
          type: "warning"
        });
      }
    }

    // talon 签名hash&广播hex
    async function handleHex(hex) {
      const tAssemble = nerve.deserializationTx(hex);

      const transfer = new NTransfer({ chain: "NERVE" });
      const txHex = await transfer.getTxHex({
        tAssemble,
        pub: addressInfo.value?.pub,
        signAddress: addressInfo.value?.address?.Ethereum
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
      loading,
      balance,
      gether,
      handleLP,
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
      cursor: not-allowed;
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
@media screen and (max-width: 1200px) {
  .gain {
    margin-left: 0;
    margin-top: 20px;
    width: 264px;
  }
  .alter {
    margin-left: 0;
    margin-top: 20px;
    width: 264px;
  }
  .info-title {
    width: 80px;
  }
}
@media screen and (max-width: 850px) {
  .farm-details {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    .biaoge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      .gain {
        margin-left: 0;
        margin-top: 20px;
        width: 280px;
      }
      .alter {
        margin-left: 0;
        margin-top: 20px;
        width: 280px;
        //.right {
        //  width: 180px !important;
        //}
        .btns {
          margin-bottom: 10px;
        }
      }
    }
  }
  .farm-item .more {
    margin-top: 15px;
  }
}
</style>
