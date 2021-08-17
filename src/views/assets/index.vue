<template>
  <div class="w1300">
    <div class="assets" v-if="!showTransfer">
      <div class="top flex-center">
        <div class="top-title">{{ $t("assets.assets1") }}</div>
        <el-divider direction="vertical"></el-divider>
        <div class="l1-net flex-center">
          <template v-if="disableTx">
            <span class="wrong-net">{{ $t("public.public14") }}</span>
          </template>
          <template v-else>
            <symbol-icon :icon="network"></symbol-icon>
            <el-tooltip
              effect="dark"
              :content="$t('assets.assets2') + network"
              placement="top"
            >
              <span class="click font_20">{{ network }}</span>
            </el-tooltip>
          </template>
        </div>
      </div>
      <div class="address-wrap flex-center">
        <div class="address">
          {{ $t("assets.assets3") }}
          {{ talonAddress }}
          <i class="iconfont icon-fuzhi" @click="$copy(talonAddress)"></i>
        </div>
        <i class="iconfont icon-tianjia" @click="showAssetManage = true"></i>
      </div>
      <div class="assets-list" v-loading="loading">
        <template v-if="tableData && tableData.length !== 0">
          <div
            class="asset-item"
            v-for="(item, index) in tableData"
            :key="index"
          >
            <span class="assets_symbol">{{ item.symbol }}</span>
            <div class="asset-info">
              <span>
                {{ $t("public.public2") }}：{{ item.number }}≈${{
                  item.valuation
                }}
              </span>
              <span>{{ $t("public.public3") }}：{{ item.available }}</span>
              <span>{{ $t("public.public4") }}：{{ item.locking }}</span>
            </div>
            <div class="option_btn">
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  {{ $t("public.public5") }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="transfer(item, 'crossIn')">
                      {{ $t("assets.assets4") }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="transfer(item, 'general')">
                      {{ $t("assets.assets5") }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="transfer(item, 'withdrawal')">
                      {{ $t("assets.assets6") }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>
        <el-empty description="No Data" v-if="!tableData.length"></el-empty>
      </div>
      <el-table
        :data="tableData"
        height="480"
        class="show_table"
        v-loading="loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column width="50px"></el-table-column>
        <el-table-column :label="$t('public.public1')" width="240">
          <template v-slot="scope">
            <div class="flex-center">
              <symbol-icon :icon="scope.row.symbol"></symbol-icon>
              <span>{{ scope.row.symbol }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="available"
          :label="$t('public.public2')"
          width="180"
        ></el-table-column>
        <el-table-column
          prop="locking"
          :label="$t('public.public3')"
          width="180"
        ></el-table-column>
        <el-table-column :label="$t('public.public4')">
          <template v-slot="scope">
            {{ scope.row.number }}
            <span class="ydy">≈${{ scope.row.valuation }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.public5')" align="center">
          <template v-slot="scope">
            <el-button
              @click="transfer(scope.row, 'crossIn')"
              type="text"
              v-if="isShowCrossHandle(scope.row)"
              :disabled="disableTx"
            >
              {{ $t("assets.assets4") }}
            </el-button>
            <el-button @click="transfer(scope.row, 'general')" type="text">
              {{ $t("assets.assets5") }}
            </el-button>
            <el-button
              @click="transfer(scope.row, 'withdrawal')"
              type="text"
              :disabled="disableTx"
              v-if="isShowCrossHandle(scope.row)"
            >
              {{ $t("assets.assets6") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        :title="$t('assets.assets7')"
        custom-class="assets-manage"
        :show-close="false"
        v-model="showAssetsDialog"
      >
        <div class="content">
          <div class="top">
            <span>{{ superLong(address, 9) }}</span>
            <span><i class="el-icon-copy-document"></i></span>
            <span><i class="el-icon-copy-document"></i></span>
          </div>
          <div class="bottom tc">
            <el-button type="primary">{{ $t("public.public7") }}</el-button>
          </div>
        </div>
      </el-dialog>
      <assets-manage
        v-model:showAssetManage="showAssetManage"
        :assetList="allAssetsList"
        :selectAssets="selectAssets"
        @addAssets="filterAssets"
      ></assets-manage>
    </div>
    <transfer
      v-else
      v-model:currentTab="currentTab"
      v-model:show="showTransfer"
    ></transfer>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import {
  chainToSymbol,
  getIconSrc,
  getTalonAddress,
  divisionAndFix,
  Plus,
  Times,
  _networkInfo
} from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
import AssetsManage from "./AssetsManage.vue";
import Transfer from "./transfer/index.vue";
import { getAssetList } from "@/model";
import config from "@/config";
import { listen } from "@/api/promiseSocket";
const url = config.WS_URL;

export default defineComponent({
  name: "assets",
  props: {},
  components: {
    SymbolIcon,
    AssetsManage,
    Transfer
  },
  provide() {
    return {
      father: this
    };
  },
  watch: {
    address: {
      immediate: true,
      handler(val) {
        console.log(val, 444);
        if (val) {
          this.getList();
        }
      }
    }
  },
  computed: {
    netIcon() {
      return getIconSrc(chainToSymbol[this.network]);
    },
    network() {
      return this.$store.getters.chain;
    },
    disableTx() {
      return this.$store.getters.wrongChain;
    },
    currentAccount() {
      return this.$store.state.addressInfo;
    },
    address() {
      return this.$store.getters.currentAddress;
    },
    talonAddress() {
      return this.$store.getters.talonAddress;
    }
  },
  data() {
    return {
      loading: true,
      showAssetManage: false,
      selectAssets: [], // 勾选显示的资产
      allAssetsList: [], // L2 所有资产
      crossInOutSymbol: [], // 支持Ethereum转入/转出的资产
      showTransfer: false,
      currentTab: "first",
      tableData: [],
      transferAsset: {}
    };
  },

  methods: {
    async getList() {
      this.loading = true;
      const res = await getAssetList(this.talonAddress);
      this.loading = false;
      const sortDataByValue = [...res].sort((a, b) => {
        return a.valuation - b.valuation > 0 ? -1 : 1;
      });
      const crossInOutSymbol = [...res].filter(item => {
        if (!item.heterogeneousList) {
          return false;
        } else {
          let supportedChain = false;
          item.heterogeneousList.map(v => {
            Object.keys(_networkInfo).map(key => {
              if (_networkInfo[key].chainId === v.heterogeneousChainId) {
                supportedChain = true;
              }
            });
          });
          return supportedChain;
        }
      });
      this.sortDataByValue = sortDataByValue;
      this.allAssetsList = res;
      this.crossInOutSymbol = crossInOutSymbol;
      this.filterAssets();
    },
    //过滤展示资产列表
    filterAssets() {
      // console.log(this.sortDataByValue, 66);
      let result = [];
      if (this.currentAccount.visiableAssets) {
        this.sortDataByValue.map(v =>
          this.currentAccount.visiableAssets.map(item => {
            if (item === v.assetKey) {
              result.push(v);
            }
          })
        );
      } else {
        const defaultSymbol = ["ETH", "USDT", "USDC"];
        result = this.sortDataByValue.filter(
          v => defaultSymbol.indexOf(v.symbol) > -1
        );
      }
      this.selectAssets = result;
      this.tableData = result;
    },

    transfer(asset, type) {
      if (type === "crossIn") {
        // L1到L2
        this.currentTab = "first";
      } else if (type === "withdrawal") {
        // L2到L1
        this.currentTab = "third";
      } else {
        // L2内部转账
        this.currentTab = "second";
      }
      this.showTransfer = true;
      this.transferAsset = asset;
      // console.log(this.transferAsset,55)
    },
    isShowCrossHandle(item) {
      if (!item.heterogeneousList) return false;
      let supportedChain = false;
      item.heterogeneousList.map(v => {
        Object.keys(_networkInfo).map(key => {
          if (_networkInfo[key].chainId === v.heterogeneousChainId) {
            supportedChain = true;
          }
        });
      });
      return supportedChain;
    }
  }
});
</script>

<style lang="scss">
.assets {
  max-height: 721px;
  background: #ffffff;
  box-shadow: 0px 2px 0px 0px #e9eaf4;
  border-radius: 50px;
  padding: 35px 40px;
  .font_20 {
    font-size: 20px;
  }
  .top {
    .top-title {
      font-size: 30px;
    }
    .el-divider {
      margin: 0 16px;
      background-color: #7e87c2;
      width: 3px;
      height: 25px;
    }
    .l1-net {
      img {
        margin-right: 10px;
      }
    }
  }
  .address-wrap {
    justify-content: space-between;
    font-size: 24px;
    color: #333;
    margin: 20px 0;
    i {
      color: #4a5ef2;
      font-size: 36px;
      cursor: pointer;
      margin-left: 20px;
    }
  }
  .el-table {
    th .cell {
      font-size: 16px;
    }
    tr .cell {
      font-size: 16px;
      color: #333;
    }
    tr .flex-center {
      span {
        font-weight: 600;
        margin-left: 10px;
      }
    }
    .el-button--text {
      color: #4a5ef2;
    }
    .ydy {
      color: #7e87c2;
    }
  }
}
.assets-list {
  display: none;
  .asset-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .assets_symbol {
      width: 100px;
    }
    .asset-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
@media screen and (max-width: 1200px) {
  .show_table {
    display: none;
  }
  .assets-list {
    display: block;
  }
  .assets {
    padding: 20px;
    border-radius: 20px !important;
  }
  .assets .top .top-title {
    font-size: 18px;
  }
  .assets .font_20 {
    font-size: 16px;
  }
  .assets .address-wrap {
    font-size: 16px !important;
    i {
      font-size: 20px;
    }
  }
  .transfer-page .bottom {
    padding: 10px;
  }
}
</style>
