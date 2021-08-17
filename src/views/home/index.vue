<template>
  <div class="w1300 home">
    <div class="overview-total lh_1">
      {{ $t("home.home1") }}{{ rewardInfo.locked }}
    </div>
    <div class="info-top pd_40">
      <div class="title">{{ $t("home.home2") }}</div>
      <div class="flex-center info-wrap">
        <div class="info-item">
          <p class="label">{{ $t("home.home3") }}</p>
          <p class="value">${{ overviewData.priceUSD }}</p>
        </div>
        <div class="info-item">
          <p class="label">{{ $t("home.home4") }}</p>
          <p class="value">{{ overviewData.circulation }}</p>
        </div>
        <div class="info-item">
          <p class="label">{{ $t("home.home5") }}</p>
          <p class="value">{{ overviewData.destroyed }}</p>
        </div>
        <div class="info-item">
          <p class="label">{{ $t("home.home6") }}</p>
          <p class="value">{{ overviewData.totalAmount }}</p>
        </div>
      </div>
    </div>
    <div class="info-middle">
      <div class="left">
        <div class="left-top pd_40">
          <div>
            <div class="title">
              {{ $t("home.home7") }}
            </div>
            <p>${{ rewardInfo.received }}</p>
          </div>
          <div class="flex1-tr">
            <i class="iconfont icon-yilingjiangli"></i>
          </div>
        </div>
        <div class="left-bottom pd_40">
          <div>
            <div class="title">
              {{ $t("home.home8") }}
            </div>
            <p>${{ rewardInfo.unclaimed }}</p>
          </div>
          <div class="flex1-tr">
            <span class="icon-wrap">
              <i class="iconfont icon-dailingjiangli"></i>
            </span>
          </div>
        </div>
        <div class="right_block pd_40">
          <div class="title">
            Farm
            <span class="more" @click="toUrl">
              {{ $t("home.home9") }}
              <i class="el-icon-arrow-right"></i>
            </span>
          </div>
          <div class="farm-list">
            <div
              class="farm-item"
              v-for="item in farmList"
              :key="item.farmHash"
            >
              <div class="coin_name">
                {{ item.name }}
              </div>
              <!--              <farm-symbol-->
              <!--                class="farm-symbol"-->
              <!--                :imgList="item.logoList"-->
              <!--                :name="item.name"-->
              <!--              ></farm-symbol>-->
              <div class="farm-info">
                <div>
                  <div class="label">APR</div>
                  <p class="value">{{ item.apr }}%</p>
                </div>
                <div>
                  <div class="label">{{ $t("home.home10") }}</div>
                  <p class="value">{{ item.syrupTokenSymbol }}</p>
                </div>
              </div>
              <div
                class="handle click"
                @click="addLP(item)"
                v-if="talonAddress"
              >
                {{ $t("home.home11") }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right pd_40">
        <div class="title">
          Farm
          <span class="more" @click="toUrl">
            {{ $t("home.home9") }}
            <i class="el-icon-arrow-right"></i>
          </span>
        </div>
        <div class="farm-list">
          <div class="farm-item" v-for="item in farmList" :key="item.farmHash">
            <farm-symbol
              class="farm-symbol"
              :imgList="item.logoList"
              :name="item.name"
            ></farm-symbol>
            <div class="farm-info">
              <div>
                <div class="label">APR</div>
                <p class="value">{{ item.apr }}%</p>
              </div>
              <div>
                <div class="label">{{ $t("home.home10") }}</div>
                <p class="value">{{ item.syrupTokenSymbol }}</p>
              </div>
            </div>
            <div class="handle click" @click="addLP(item)" v-if="talonAddress">
              {{ $t("home.home11") }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="info-bottom pd_40 flex-center">
      <div class="info-item">
        <p class="label">{{ $t("home.home12") }}</p>
        <p class="value">${{ txInfo.amount }}</p>
      </div>
      <div class="info-item">
        <p class="label">{{ $t("home.home13") }}</p>
        <p class="value">{{ txInfo.count }}</p>
      </div>
      <div class="info-item">
        <p class="label">{{ $t("home.home14") }}</p>
        <p class="value">${{ txInfo.fee }}</p>
      </div>
    </div>
    <lp-dialog
      v-model:showLPDialog="showLPDialog"
      :loading="dialogLoading"
      :balance="lpBalance"
      addOrMinus="add"
      :lpName="addLpInfo.name"
      :decimal="addLpInfo.stakeTokenDecimals"
      @confirm="confirmAddOrMinus"
    ></lp-dialog>
  </div>
</template>

<script>
import FarmSymbol from "@/views/farm/FarmSymbol.vue";
import LpDialog from "@/components/LpDialog";
import { listen, unListen } from "@/api/websocket";
import config from "@/config";
import { genId, divisionDecimals, timesDecimals } from "@/api/util";
import { getAssetBalance } from "@/model";
import { NTransfer } from "@/api/api";
import nerve from "nerve-sdk-js";

const url = config.WS_URL;

export default {
  name: "Home",
  components: {
    FarmSymbol,
    LpDialog
  },
  props: {},
  data() {
    return {
      loading: null,
      overviewData: {},
      rewardInfo: {},
      farmList: [],
      txInfo: {},
      showLPDialog: false,
      dialogLoading: false,
      addLpInfo: {},
      lpBalance: ""
    };
  },
  computed: {
    talonAddress() {
      return this.$store.state.addressInfo?.address?.Talon;
    }
  },
  mounted() {
    this.loading = this.$loading({
      // lock: true,
      // text: "Loading",
      // spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });
    this.getOverview();
    this.getRewardInfo();
    this.getFarmInfo();
    this.getTxInfo();
  },
  methods: {
    getOverview() {
      const channel = "mainAssetInfo";
      const params = {
        method: channel
      };
      listen({
        url,
        channel,
        params: {
          cmd: true,
          channel: "cmd:" + JSON.stringify(params)
        },
        success: data => {
          console.log(data, "mainAssetInfo");
          const decimal = data.decimals;
          this.overviewData = {
            priceUSD: data.priceUSD,
            circulation: divisionDecimals(data.circulation, decimal),
            destroyed: divisionDecimals(data.destroyed, decimal),
            totalAmount: divisionDecimals(data.totalAmount, decimal)
          };
          this.loading.close();
        }
      });
    },
    getRewardInfo() {
      const channel = "rewardSummary";
      const params = {
        method: channel,
        id: genId()
      };
      listen({
        url,
        channel,
        params: {
          cmd: true,
          channel: "cmd:" + JSON.stringify(params)
        },
        success: data => {
          this.rewardInfo = data;
        }
      });
    },
    getFarmInfo() {
      const channel = "farmPage";
      const params = {
        method: channel,
        id: genId(),
        params: {
          pageIndex: 1,
          pageSize: 3,
          orderby: "apr"
        }
      };
      listen({
        url,
        channel,
        params: {
          cmd: true,
          channel: "cmd:" + JSON.stringify(params)
        },
        success: data => {
          data.map(v => {
            v.logoList = v.logo2 ? [v.logo, v.logo2] : [v.logo];
            v.stakeAmount = 0;
            v.stakeUSD = 0;
            v.pendingRewardUSD = 0;
            v.pendingReward = 0;
          });
          this.farmList = data;
        }
      });
    },
    getTxInfo() {
      const channel = "tradingVolume";
      listen({
        url,
        channel,
        params: {
          cmd: false,
          channel
        },
        success: data => {
          this.txInfo = data;
        }
      });
    },
    addLP(item) {
      this.showLPDialog = true;
      this.addLpInfo = item;
      this.getBalance();
    },
    async getBalance() {
      const { stakeTokenChainId, stakeTokenAssetId, stakeTokenDecimals } =
        this.addLpInfo;
      const res = await getAssetBalance(
        stakeTokenChainId,
        stakeTokenAssetId,
        this.talonAddress
      );
      this.lpBalance = divisionDecimals(res.balance, stakeTokenDecimals);
    },
    async confirmAddOrMinus(amount) {
      this.dialogLoading = true;
      try {
        const {
          stakeTokenChainId,
          stakeTokenAssetId,
          stakeTokenDecimals,
          farmHash
        } = this.addLpInfo;
        const ammount = timesDecimals(amount, stakeTokenDecimals);
        const tx = await nerve.swap.farmStake(
          this.talonAddress,
          nerve.swap.token(stakeTokenChainId, stakeTokenAssetId),
          config.chainId,
          config.prefix,
          ammount,
          farmHash,
          ""
        );
        await this.handleHex(tx.hex);
      } catch (e) {
        console.log(e, "add-lp-error");
        this.$message({
          message: e.message || e,
          type: "warning"
        });
      }
      this.dialogLoading = false;
    },
    async handleHex(hex) {
      const tAssemble = nerve.deserializationTx(hex);

      const transfer = new NTransfer({ chain: "NERVE" });
      const addressInfo = this.$store.state.addressInfo;
      const txHex = await transfer.getTxHex({
        tAssemble,
        pub: addressInfo.pub,
        signAddress: addressInfo.address.Ethereum
      });
      console.log(txHex, 666);
      const result = await transfer.broadcastHex(txHex);
      if (result && result.hash) {
        this.showLPDialog = false;
        this.$message({
          message: this.$t("transfer.transfer14"),
          type: "success"
        });
      } else {
        this.$message({
          message: "Failed",
          type: "warning"
        });
      }
    },
    toUrl() {
      this.$router.push("/farm");
    }
  }
};
</script>

<style lang="scss">
.home {
  padding-bottom: 60px;
  margin-top: -15px;
  .lh_1 {
    line-height: 1;
  }
  .pd_40 {
    padding: 40px;
    background-color: #fff;
    border-radius: 20px;
  }
  .title {
    font-size: 20px;
    line-height: 1;
    margin-bottom: 28px;
    font-weight: 600;
  }
  .label {
    font-size: 16px;
    color: #7e87c2;
  }
  .info-item {
    flex: 1;
    text-align: center;
  }
  .value {
    font-size: 24px;
    margin-top: 5px;
  }
  .overview-total {
    font-size: 30px;
    color: #fff;
    text-align: center;
    margin-bottom: 40px;
  }
  .info-top {
    height: 200px;
  }
  .info-middle {
    margin: 40px 0;
    display: flex;
    .left {
      margin-right: 40px;
      width: 500px;
      .left-top,
      .left-bottom {
        display: flex;
        height: 177px;
        p {
          font-size: 30px;
          line-height: 1;
          font-weight: 600;
        }
        .flex1-tr {
          flex: 1;
          text-align: right;
        }
        .iconfont {
          font-size: 80px;
          color: #d7dcfc;
        }
      }
      .left-top {
        margin-bottom: 40px;
      }
      .left-bottom {
        .icon-wrap {
          font-size: 90px;
          transform: rotate(30deg);
          display: inline-block;
        }
      }
    }
    .right {
      flex: 1;
      height: 394px;
      overflow: hidden;
      .title {
        position: relative;
        .more {
          position: absolute;
          right: 0;
          top: 0;
          color: #4a5ef2;
          font-size: 16px;
          cursor: pointer;
          font-weight: 400;
        }
      }
      .farm-list {
        height: 240px;
        overflow: auto;
      }
      .farm-item {
        margin-top: 32px;
        height: 58px;
        display: flex;
        align-items: center;
        &:first-child {
          margin-top: 0;
        }
        .farm-symbol {
          width: 285px;
        }
        .farm-info {
          flex: 1;
          display: flex;
          align-items: center;
          height: 100%;
          & > div {
            flex: 1;
          }
          .label {
            font-size: 14px;
          }
          .value {
            font-size: 18px;
            font-weight: 600;
          }
        }
        .handle {
          color: #4a5ef2;
          margin-right: 20px;
        }
      }
    }
  }
  .info-bottom {
    .value {
      line-height: 1;
      margin-top: 10px;
    }
  }
}
.info-wrap {
  align-items: normal;
}
.right_block {
  display: none;
  flex: 1;
  height: 394px;
  overflow: hidden;
  .title {
    position: relative;
    .more {
      position: absolute;
      right: 0;
      top: 0;
      color: #4a5ef2;
      font-size: 16px;
      cursor: pointer;
      font-weight: 400;
    }
  }
  .farm-list {
    height: 240px;
    overflow: auto;
  }
  .farm-item {
    margin-top: 32px;
    height: 58px;
    display: flex;
    align-items: center;
    &:first-child {
      margin-top: 0;
    }
    .farm-symbol {
      width: 285px;
    }
    .farm-info {
      flex: 1;
      display: flex;
      align-items: center;
      height: 100%;
      & > div {
        flex: 1;
      }
      .label {
        font-size: 14px;
      }
      .value {
        font-size: 18px;
        font-weight: 600;
      }
    }
    .handle {
      color: #4a5ef2;
      margin-right: 20px;
    }
  }
}
@media screen and (max-width: 1200px) {
  .home .info-middle .right {
    height: 500px;
    display: none;
  }
  .home .info-middle .left {
    margin-right: 0 !important;
    width: 100% !important;
    .left-bottom {
      margin-bottom: 40px !important;
    }
  }
  .right_block {
    display: block !important;
    width: 100% !important;
    padding: 20px !important;
  }
  .pd_40_rd_20 {
    padding: 24px;
  }
  .coin_name {
    font-size: 14px;
    font-weight: bold;
    width: 180px;
  }
  .home .value {
    font-size: 20px;
  }
}

@media screen and (max-width: 600px) {
  .home .overview-total {
    font-size: 20px !important;
  }
  .home .info-top {
    height: auto !important;
  }
  .home .info-middle .right {
    height: 500px;
    display: none;
  }
  .coin_name {
    font-size: 14px;
    font-weight: bold;
    width: 80px;
  }
  .info-wrap {
    display: flex;
    flex-direction: column;
    .info-item {
      display: flex;
      align-items: center;
      margin-top: 10px;
      .label {
        width: 65px;
        font-size: 14px;
      }
      .value {
        font-size: 16px !important;
      }
    }
    .home .pd_40 {
      padding: 20px !important;
    }
  }
  .right_block {
    display: block;
    font-size: 14px;
  }
  .right_block .farm-item .farm-info .value {
    font-size: 14px;
  }
  .home .title {
    font-size: 17px;
  }
  .info-bottom {
    padding: 24px !important;
  }
}
@media screen and (max-width: 650px) {
  .home .info-middle .left .left-top {
    div {
      p {
        font-size: 20px !important;
      }
    }
  }
  .home .info-middle .left .left-bottom {
    div {
      p {
        font-size: 20px !important;
      }
    }
  }
}
</style>
