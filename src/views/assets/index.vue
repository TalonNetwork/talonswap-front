<template>
  <div class="w1300 assets" v-if="!showTransfer">
    <div class="top flex-center">
      <div class="top-title">{{ $t("assets.assets1") }}</div>
      <el-divider direction="vertical"></el-divider>
      <div class="l1-net flex-center">
        <symbol-icon :icon="network"></symbol-icon>
        <el-tooltip
          effect="dark"
          :content="$t('assets.assets2') + network"
          placement="top"
        >
          <span class="click">{{ network }}</span>
        </el-tooltip>
      </div>
    </div>
    <div class="address-wrap flex-center">
      <div class="address">
        {{ $t("assets.assets3") }}
        TalonXXXXXXXXXX
        <i class="iconfont icon-fuzhi"></i>
      </div>
      <i class="iconfont icon-tianjia" @click="showAssetManage = true"></i>
    </div>
    <el-table :data="tableData" height="375">
      <el-table-column width="50px"></el-table-column>
      <el-table-column
        prop="symbol"
        :label="$t('public.public1')"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="available"
        :label="$t('public.public2')"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="lock"
        :label="$t('public.public3')"
      ></el-table-column>
      <el-table-column
        prop="total"
        :label="$t('public.public4')"
      ></el-table-column>
      <el-table-column :label="$t('public.public5')" align="center">
        <template v-slot="scope">
          <el-button
            @click="inChains(scope.row)"
            type="text"
            v-if="isShowCrossHandle(scope.row.source)"
          >
            {{ $t("assets.assets4") }}
          </el-button>
          <!--              <el-button type="text" v-else disabled>-</el-button>-->
          <el-button @click="crossLink(scope.row)" type="text">
            {{ $t("assets.assets5") }}
          </el-button>
          <el-button
            @click="withdrawal(scope.row)"
            type="text"
            v-if="isShowCrossHandle(scope.row.source)"
          >
            {{ $t("assets.assets6") }}
          </el-button>
          <!--              <el-button type="text" v-else disabled>-</el-button>-->
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
    :network="network"
    :refresh="refresh"
  ></transfer>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from "vue";
import { chainToSymbol, getIconSrc } from "@/api/util";
import SymbolIcon from "@/components/SymbolIcon.vue";
import AssetsManage from "./AssetsManage.vue";
import Transfer from "./transfer/index.vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "assets",
  props: {},
  components: {
    SymbolIcon,
    AssetsManage,
    Transfer
  },
  setup() {
    const state = reactive({
      showAssetManage: false,
      selectAssets: [],
      allAssetsList: [],
      showTransfer: false,
      network: "Ethereum",
      currentTab: "first",
      tableData: [
        {
          symbol: "ETH",
          available: 1,
          lock: 2,
          total: 3,
          source: 4
        },
        {
          symbol: "BNB",
          available: 1,
          lock: 2,
          total: 3
        }
      ],
      refresh: false
    });
    const netIcon = computed(() => getIconSrc(chainToSymbol[state.network]));

    const store = useStore();
    watch(
      () => store.state.address,
      val => {
        if (val) {
          state.refresh = true;
        }
        console.log(val, 8888)
      },
      {
        immediate: true
      }
    )

    //过滤展示资产列表
    function filterAssets() {
      /* const currentAddress = this.$store.getters.getSelectAddress
      const accountList = this.$store.state.accountList;
      this.allAssetsList = assetSort([...accountList])
      if (currentAddress.visiableAssets) {
        const list = assetSort([...accountList]);
        const res = []

        // 解决线上nvt nuls不被勾选无法修改问题
        const nerve = ETHNET === 'ropsten' ? "5-1" : "9-1"
        const nuls = ETHNET === 'ropsten' ? "2-1" : "1-1"
        if (currentAddress.visiableAssets.indexOf(nerve) === -1 || currentAddress.visiableAssets.indexOf(nuls) === -1) {
          const defaultAsset = ETHNET === 'ropsten' ? ["5-1", "2-1", "5-2", "5-22"] : ["9-1", "1-1", "9-2", "9-25"]
          const list = assetSort([...accountList]).filter(item => {
            return defaultAsset.indexOf(item.assetKey) > -1 || Number(item.totalBalance) !== 0
          })
          this.selectAssets = list.map(v => v.assetKey)
          this.accountList = list
          //
        } else {
          list.map(item => {
            currentAddress.visiableAssets.map(v => {
              if (item.assetKey === v) {
                res.push(item)
              }
            })
          })
          this.selectAssets = [...currentAddress.visiableAssets]
          this.accountList = res
        }
      } else {
        const defaultAsset = ETHNET === 'ropsten' ? ["5-1", "2-1", "5-2", "5-22"] : ["9-1", "1-1", "9-2", "9-25"]
        const list = assetSort([...accountList]).filter(item => {
          return defaultAsset.indexOf(item.assetKey) > -1 || Number(item.totalBalance) !== 0
        })
        this.selectAssets = list.map(v => v.assetKey)
        this.accountList = list
      } */
    }

    // L1到L2
    function inChains() {
      state.currentTab = "first";
      state.showTransfer = true;
    }

    // L2内部转账
    function crossLink() {
      //
      state.currentTab = "second";
      state.showTransfer = true;
    }

    // L2到L1
    function withdrawal() {
      //
      state.currentTab = "third";
      state.showTransfer = true;
    }
    function isShowCrossHandle(status: number) {
      const showArr = [4, 5, 6, 7, 8, 9];
      return showArr.indexOf(status) > -1;
    }
    return {
      ...toRefs(state),
      netIcon,
      filterAssets,
      inChains,
      crossLink,
      withdrawal,
      isShowCrossHandle
    };
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
  .el-table::before {
    height: 0;
  }
  .el-table th {
    background-color: #4a5ef2;
    color: #fff;
    &:first-child {
      border-radius: 10px 0 0 10px;
    }
    &:last-child {
      border-radius: 0 10px 10px 0;
    }
    .cell {
      line-height: 35px;
    }
  }
}
</style>
