<template>
  <div class="cross-in">
    <div class="title">
      {{
        $t("transfer.transfer4") +
        " " +
        father.network +
        $t("transfer.transfer5")
      }}
      <span>
        {{ superLong(father.address) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button
        type="primary"
        v-if="!needAuth"
        @click="sendTx"
        :disabled="disableTransfer || noEnoughBalance"
      >
        {{
          noEnoughBalance ? $t("transfer.transfer15") : $t("transfer.transfer9")
        }}
      </el-button>
      <el-button type="primary" v-else @click="approveERC20">
        {{ $t("transfer.transfer13") }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
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
      if (val && this.transferAsset) {
        // this.getFee();
      }
    },
    transferAsset: {
      handler(val) {
        if (val && this.amount) {
          // this.getFee();
        }
      }
    }
  },
  data() {
    this.heterogeneousInfo = null; // 异构链信息
    return {
      transferAsset: {},
      amount: "",
      balance: 0,
      fee: 0,
      needAuth: false, // token资产是否需要授权
      assetsList: []
    };
  },
  computed: {
    disableTransfer() {
      return !Number(this.fee) || !Number(this.amount) || !Number(this.balance);
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
      console.log(123465,this.father);
      const chain = _networkInfo[this.father.network];
      this.assetsList = this.father.allAssetsList.filter(v => {
        return v.heterogeneousList?.filter(item => {
          return item.heterogeneousChainId === chain.chainId;
        });
      });
    },
    async selectAsset(asset) {
      console.log(asset, 789654, this.father);
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
    },
    async getGasPrice() {
      this.fee = await this.transfer.getGasPrice(
        this.heterogeneousInfo.isToken
      );
      console.log(this.fee, 444);
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
      console.log(this.balance, 666222);
    },
    superLong(str, len = 8) {
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
      const { contractAddress, heterogeneousChainMultySignAddress } =
        this.heterogeneousInfo;
      try {
        const res = await this.transfer.approveERC20(
          contractAddress,
          heterogeneousChainMultySignAddress,
          this.father.address
        );
        this.handleMsg(res);
      } catch (e) {
        this.$message({
          message: e,
          type: "warning"
        });
      }
    },
    async sendTx() {
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
        console.log(params);
        const res = await this.transfer.crossIn(params);
        this.handleMsg(res);
      } catch (e) {
        console.log(e, "transfer-error");
        this.$message({
          message: e,
          type: "warning"
        });
      }
    },
    handleMsg(data) {
      console.log(data, 555);
      if (data.success) {
        this.amount = "";
        // this.txHash = data.msg;
        this.$message({
          message: this.$t("transfer.transfer14"),
          type: "success"
        });
      } else {
        this.$message({ message: data.msg, type: "warning" });
      }
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
}
</style>
