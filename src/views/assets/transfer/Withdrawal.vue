<template>
  <div
    class="cross-out"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <div class="title">
      {{
        $t("transfer.transfer7") +
        " " +
        father.network +
        $t("transfer.transfer8")
      }}
      <span class="click" @click="openUrl(father.address, father.network)">
        {{ superLong(father.address) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="wrong-net" v-if="father.disableTx">
      {{ $t("public.public14") }}
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :label="$t('transfer.transfer20')"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        :errorTip="amountErrorTip"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
      <div class="fee">
        {{ $t("public.public15") }}
        <span class="el-icon-loading" v-if="!fee"></span>
        <span v-else>{{ fee + " " + feeSymbol }}</span>
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary" @click="sendTx" :disabled="disableTransfer">
        {{ $t("transfer.transfer11") }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import CustomInput from "@/components/CustomInput.vue";
import {
  superLong,
  Minus,
  timesDecimals,
  _networkInfo,
  divisionDecimals,
  Times,
  Plus
} from "@/api/util";
import { NTransfer, ETransfer, getSymbolUSD } from "@/api/api";
import config from "@/config";
export default defineComponent({
  name: "withdrawal",
  inject: ["father"],
  components: {
    CustomInput
  },
  data() {
    return {
      loading: false,
      assetsList: [],
      amount: "",
      balance: "",
      transferAsset: {},
      amountErrorTip: "",
      fee: 0,
      feeSymbol: config.symbol
    };
  },
  watch: {
    amount(val) {
      if (val) {
        const nvtBalance = this.assetsList.find(v => {
          return v.chainId === config.chainId && v.assetId === config.assetId;
        }).available;
        const isNVT =
          this.transferAsset.chainId === config.chainId &&
          this.transferAsset.assetId === config.assetId;
        /* let decimals = this.transferAsset.decimals || 0;
        let patrn = "";
        if (!decimals) {
          patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
        } else {
          patrn = new RegExp(
            "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
          );
        }
        if (!patrn.exec(val)) {
          this.amountErrorTip = this.$t("transfer.transfer17") + decimals;
        } else  */
        if (
          !Number(this.balance) ||
          Minus(this.balance, this.amount) < 0 ||
          (isNVT && Minus(this.balance, Plus(this.amount, this.fee)) < 0)
        ) {
          this.amountErrorTip = this.$t("transfer.transfer15");
        } else if (Minus(nvtBalance, this.fee) < 0) {
          this.amountErrorTip = this.$t("transfer.transfer18");
        } else {
          this.amountErrorTip = "";
        }
      }
    },
    "father.crossInOutSymbol": {
      deep: true,
      handler() {
        this.filterAssets();
        this.selectAsset(this.father.transferAsset);
      }
    }
  },
  computed: {
    disableTransfer() {
      return !!(
        !Number(this.amount) ||
        !Number(this.balance) ||
        !Number(this.fee) ||
        this.addressError ||
        this.amountErrorTip ||
        this.father.disableTx
      );
    }
  },
  mounted() {
    // console.log(this.father, "===commontransfer===");
    // console.log(this.$store.state.addressInfo, "===addressInfo===");
    this.filterAssets();
    this.selectAsset(this.father.transferAsset);
  },
  methods: {
    filterAssets() {
      // console.log(123465,this.father);
      const chain = _networkInfo[this.father.network];
      if (this.father.disableTx || !chain) return;
      this.assetsList = this.father.crossInOutSymbol.filter(v => {
        return v.heterogeneousList?.filter(item => {
          return item.heterogeneousChainId === chain.chainId;
        });
      });
    },
    selectAsset(asset) {
      if (this.father.disableTx) return;
      this.fee = 0;
      this.amount = "";
      this.balance = "";
      this.heterogeneousInfo = {}; // 异构链信息
      const heterogeneousList = asset.heterogeneousList || [];
      // 目标异构链ID
      const heterogeneousChainId = _networkInfo[this.father.network]?.chainId;
      if (!heterogeneousChainId) return;
      const heterogeneousInfo = heterogeneousList.find(
        v => v.heterogeneousChainId === heterogeneousChainId
      );
      this.heterogeneousInfo = heterogeneousInfo;
      // console.log(heterogeneousInfo, 123456);
      if (heterogeneousInfo) {
        this.transferAsset = asset;
        this.balance = this.transferAsset.available;
        this.heterogeneousInfo = heterogeneousInfo;
        this.getCrossOutFee();
      } else {
        this.transferAsset = {};
      }
    },
    async getCrossOutFee() {
      const transfer = new ETransfer(this.father.network);
      const nvtUSD = await getSymbolUSD();
      const mainAsset = this.assetsList.find(
        v => v.symbol === this.heterogeneousInfo.chainName
      );
      const heterogeneousChainUSD = await getSymbolUSD({
        chaiId: mainAsset.chaiId,
        assetId: mainAsset.assetId
      });
      const res = await transfer.calWithdrawalNVTFee(
        String(nvtUSD),
        String(heterogeneousChainUSD),
        this.heterogeneousInfo.isToken
      );
      console.log(res, 111, divisionDecimals(res, 8));
      this.fee = Times(divisionDecimals(res, 8), 1.2).toString();
    },
    max() {
      if (!this.balance) return;
      const isNVT =
        this.transferAsset.chainId === config.chainId &&
        this.transferAsset.assetId === config.assetId;
      if (isNVT) {
        if (!this.fee) return;
        this.amount = Minus(this.balance, this.fee).toString();
      } else {
        this.amount = this.balance;
      }
    },
    async sendTx() {
      this.loading = true;
      try {
        const { chainId, assetId, decimals } = this.transferAsset;
        const { talonAddress, address } = this.father;

        const transferInfo = {
          from: talonAddress,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: timesDecimals(this.amount, decimals),
          fee: 0,
          proposalPrice: timesDecimals(this.fee, 8)
        };

        console.log(transferInfo);
        const transfer = new NTransfer({
          chain: "NERVE",
          type: 43
        });
        const inputOuput = await transfer.WithdrawalTransaction(transferInfo);
        // console.log(inputOuput, 456456465)
        const addressInfo = this.$store.state.addressInfo;
        const txData = {
          heterogeneousAddress: address,
          heterogeneousChainId: this.heterogeneousInfo.heterogeneousChainId
        };
        const data = {
          inputs: inputOuput.inputs,
          outputs: inputOuput.outputs,
          txData,
          pub: addressInfo.pub,
          signAddress: address
        };
        const txHex = await transfer.getTxHex(data);
        console.log(txHex, 9999);
        const result = await transfer.broadcastHex(txHex);
        if (result && result.hash) {
          this.amount = "";
          this.$message({
            message: this.$t("transfer.transfer14"),
            type: "success"
          });
        } else {
          this.$message({ message: "Broadcast tx failed", type: "warning" });
        }
      } catch (e) {
        console.log(e, "common-transfer-error");
        this.$message({
          message: e.message || e,
          type: "warning"
        });
      }
      this.loading = false;
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    },
    openUrl(address, network) {
      const { origin } = _networkInfo[network];
      window.open(origin + "/address/" + address);
    }
  }
});
</script>

<style lang="scss" scoped>
.cross-out {
  .title {
    font-size: 18px;
    span {
      color: #4a5ef2;
    }
  }
  .transfer-content {
    margin: 35px 0 60px;
  }
  .fee {
    color: #7e87c2;
    font-size: 14px;
    margin-top: 20px;
  }
  .wrong-net {
    margin-top: 10px;
  }
}
</style>
