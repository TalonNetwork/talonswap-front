<template>
  <div
    class="cross-in"
    v-loading="loading"
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <div class="title">
      {{
        $t("transfer.transfer4") +
        " " +
        father.network +
        $t("transfer.transfer5")
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
        :label="$t('public.public11')"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        :errorTip="amountErrorTip"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button
        type="primary"
        v-if="!needAuth"
        @click="sendTx"
        :disabled="disableTransfer"
      >
        {{
          noEnoughBalance ? $t("transfer.transfer15") : $t("transfer.transfer9")
        }}
      </el-button>
      <el-button
        type="primary"
        v-else
        @click="approveERC20"
        :disabled="father.disableTx"
      >
        {{ $t("transfer.transfer13") }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import CustomInput from "@/components/CustomInput.vue";
import { superLong, _networkInfo, Minus } from "@/api/util";
import { ETransfer } from "@/api/api";
export default defineComponent({
  name: "crossIn",
  components: {
    CustomInput
  },
  inject: ["father"],
  watch: {
    amount(val) {
      if (val) {
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
        if (!Number(this.balance) || Minus(this.balance, this.amount) < 0) {
          this.amountErrorTip = this.$t("transfer.transfer15");
        } else {
          this.amountErrorTip = "";
        }
      }
    },
    "father.crossInOutSymbol": {
      deep: true,
      handler() {
        console.log(99999);
        this.filterAssets();
        this.selectAsset(this.father.transferAsset);
      }
    }
  },
  data() {
    this.heterogeneousInfo = null; // 异构链信息
    return {
      loading: false,
      transferAsset: {},
      amount: "",
      balance: 0,
      fee: 0,
      needAuth: false, // token资产是否需要授权
      assetsList: [],
      amountErrorTip: ""
    };
  },
  computed: {
    disableTransfer() {
      return !!(
        !Number(this.fee) ||
        !Number(this.amount) ||
        !Number(this.balance) ||
        this.amountErrorTip ||
        this.father.disableTx
      );
    },
    // 余额不足
    noEnoughBalance() {
      if (!Number(this.balance) || !Number(this.amount)) return false;
      return Minus(this.balance, this.amount) < 0;
    }
  },
  mounted() {
    this.transfer = new ETransfer();
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
    async selectAsset(asset) {
      console.log(asset, 789654, this.father);
      if (this.father.disableTx) return;
      this.checkAsset(asset);
    },
    // 检查资产是否支持从该异构链转入
    async checkAsset(asset) {
      // const asset = this.transferAsset;
      this.fee = "";
      this.amount = "";
      this.balance = "";
      this.needAuth = false;
      const heterogeneousList = asset.heterogeneousList || [];
      const heterogeneousChainId = _networkInfo[this.father.network]?.chainId;
      if (!heterogeneousChainId) return;
      const heterogeneousInfo = heterogeneousList.find(
        v => v.heterogeneousChainId === heterogeneousChainId
      );
      this.heterogeneousInfo = heterogeneousInfo;
      // console.log(heterogeneousInfo, 123456);
      if (heterogeneousInfo) {
        this.transferAsset = asset;
        if (heterogeneousInfo.isToken) {
          this.getERC20Allowance();
        }
        await this.getGasPrice();
        this.getBalance();
      } else {
        this.transferAsset = {};
      }
    },
    // token资产查询授权额度
    async getERC20Allowance() {
      const { contractAddress, heterogeneousChainMultySignAddress } =
        this.heterogeneousInfo;
      this.needAuth = await this.transfer.getERC20Allowance(
        contractAddress,
        heterogeneousChainMultySignAddress,
        this.father.address
      );
      if (!this.needAuth) {
        this.refreshAuth = false;
      }
      if (this.refreshAuth) {
        setTimeout(() => {
          this.getERC20Allowance();
        }, 5000);
      }
    },
    async getGasPrice() {
      this.fee = await this.transfer.getGasPrice(
        this.heterogeneousInfo.isToken
      );
      // console.log(this.fee, 444);
    },
    async getBalance() {
      const { contractAddress, isToken } = this.heterogeneousInfo;
      if (isToken) {
        this.balance = await this.transfer.getERC20Balance(
          contractAddress,
          this.transferAsset.decimals,
          this.father.address
        );
      } else {
        this.balance = await this.transfer.getEthBalance(this.father.address);
      }
      // console.log(this.balance, "===balance===");
    },
    superLong(str, len = 6) {
      return superLong(str, len);
    },
    max() {
      if (!this.balance) return;
      if (this.heterogeneousInfo.isToken) {
        this.amount = this.balance;
      } else {
        if (!this.fee) return;
        this.amount = Minus(this.balance, this.fee).toString();
      }
    },
    async approveERC20() {
      this.loading = true;
      const { contractAddress, heterogeneousChainMultySignAddress } =
        this.heterogeneousInfo;
      try {
        const res = await this.transfer.approveERC20(
          contractAddress,
          heterogeneousChainMultySignAddress,
          this.father.address
        );
        this.handleMsg(res);
        if (res.hash) {
          this.refreshAuth = true;
          this.getERC20Allowance();
        }
      } catch (e) {
        this.$message({
          message: e.message || e,
          type: "warning"
        });
      }
      this.loading = false;
    },
    async sendTx() {
      this.loading = true;
      try {
        const { contractAddress, heterogeneousChainMultySignAddress } =
          this.heterogeneousInfo;
        const params = {
          multySignAddress: heterogeneousChainMultySignAddress,
          nerveAddress: this.father.talonAddress,
          numbers: this.amount,
          fromAddress: this.father.address,
          contractAddress,
          decimals: this.transferAsset.decimals
        };
        // console.log(params);
        const res = await this.transfer.crossIn(params);
        this.handleMsg(res);
      } catch (e) {
        console.log(e, "crossin-transfer-error");
        this.$message({
          message: e.message || e,
          type: "warning"
        });
      }
      this.loading = false;
    },
    handleMsg(data) {
      // console.log(data, 555);
      if (data.hash) {
        this.amount = "";
        this.$message({
          message: this.$t("transfer.transfer14"),
          type: "success"
        });
      } else {
        this.$message({ message: data.message || data, type: "warning" });
      }
    },
    openUrl(address, network) {
      const { origin } = _networkInfo[network];
      window.open(origin + "/address/" + address);
    }
  }
});
</script>

<style lang="scss" scoped>
.cross-in {
  .title {
    font-size: 18px;
    span {
      color: #4a5ef2;
    }
  }
  .transfer-content {
    margin: 35px 0 60px;
  }
  .wrong-net {
    margin-top: 10px;
  }
}
</style>
