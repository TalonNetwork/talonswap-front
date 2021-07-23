<template>
  <el-dialog
    custom-class="add-assets-dialog"
    :title="$t('assets.assets7')"
    :show-close="false"
    v-model="show"
    @closed="close"
  >
    <el-input
      v-model="searchVal"
      :placeholder="$t('assets.assets8')"
    ></el-input>
    <ul class="list-wrap">
      <li
        v-for="item in list"
        :key="item.assetKey"
        @click="changeSelect(item.assetKey)"
      >
        <img :src="item.icon" />
        <div class="asset-base-info">
          <div>
            {{ item.name }}
            <span class="font12">{{ "(" + item.originNetwork + ")" }}</span>
          </div>
          <span>ID: {{ item.assetKey }}</span>
        </div>
        <!-- <div class="circulation-network">
          <div>{{ $t("home.home14") + ": " }}{{ item.circulationNetwork }}</div>
        </div> -->
        <el-checkbox
          v-model="item.added"
          :disabled="checkDisabled(item.assetKey)"
        ></el-checkbox>
      </li>
    </ul>
    <div class="footer-wrap">
      <el-button @click="close">{{ $t("public.public8") }}</el-button>
      <el-button type="primary" @click="confirm">
        {{ $t("public.public9") }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import _ from "lodash";
import { isBeta } from "@/api/util";
export default {
  data() {
    this.allAssetsList = [];
    return {
      show: false,
      list: [],
      searchVal: "",
      defaultAssets: isBeta ? ["5-1", "2-1"] : ["9-1", "1-1"]
    };
  },
  props: {
    showAssetManage: Boolean,
    assetList: {
      type: Array,
      default: () => []
    },
    selectAssets: {
      type: Array,
      default: () => []
    }
  },

  components: {},

  watch: {
    showAssetManage: {
      immediate: true,
      handler(val) {
        console.log(val, 132);
        this.show = val;
      }
    },
    searchVal(val) {
      this.filter(val);
    },
    assetList: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val || !val.length) return;
        const list = _.cloneDeep(this.assetList);
        list.map(item => {
          item.added = false;
          const network = ["NULS", "NERVE"];
          if (item.heterogeneousList && item.heterogeneousList.length) {
            // const network = ["NULS","NERVE"]
            item.heterogeneousList.map(v => {
              if (v.heterogeneousChainId === 101) {
                network.push("Ethereum");
              } else if (v.heterogeneousChainId === 102) {
                network.push("BSC");
              } else if (v.heterogeneousChainId === 103) {
                network.push("Heco");
              } else if (v.heterogeneousChainId === 104) {
                network.push("OKExChain");
              }
            });
          }
          item.circulationNetwork = network.join();
          this.selectAssets.map(v => {
            if (item.assetKey === v) {
              item.added = true;
            }
          });
        });
        this.allAssetsList = list;
        this.filter(this.searchVal);
      }
    }
  },
  methods: {
    filter(str) {
      if (!str) {
        this.list = this.allAssetsList.filter(v => v);
      } else {
        this.list = this.allAssetsList.filter(v => {
          return (
            v.assetKey.indexOf(str) > -1 ||
            v.name.toUpperCase().indexOf(str.toUpperCase()) > -1
          );
        });
      }
    },
    changeSelect(key) {
      const isDefaultAsset = this.checkDisabled(key);
      if (isDefaultAsset) return;
      this.allAssetsList.map(v => {
        if (v.assetKey === key) {
          v.added = !v.added;
        }
      });
      // this.filter()
    },
    checkDisabled(key) {
      return this.defaultAssets.indexOf(key) > -1;
    },
    close() {
      console.log(4444)
      this.$emit("update:showAssetManage", false);
    },
    confirm() {
      const select = [];
      this.allAssetsList.map(v => {
        if (v.added) {
          select.push(v.assetKey);
        }
      });
      const addressInfo = [...this.$store.state.addressInfo];
      addressInfo.map(v => {
        if (v.selection) {
          v.visiableAssets = select;
        }
      });
      this.$store.commit("setAddressInfo", addressInfo);
      this.$emit("addAssets");
      this.close();
    }
  }
};
</script>
<style lang="scss">
.add-assets-dialog {
  width: 470px !important;
  .list-wrap {
    max-height: 55vh;
    overflow-y: auto;
    li {
      display: flex;
      align-items: center;
      height: 50px;
      border-bottom: 1px solid #dfe4ef;
      cursor: pointer;
      img {
        height: 28px;
        margin-right: 10px;
      }
      .asset-base-info {
        width: 120px;
      }
      .circulation-network {
        flex: 1;
        margin-right: 10px;
        div {
          margin-top: 20px;
        }
      }
      .el-checkbox {
        margin-right: 10px;
      }
    }
  }
  .footer-wrap {
    padding-top: 60px;
    .el-button {
      width: 185px;
      height: 48px;
      & + .el-button {
        margin-left: 20px;
      }
    }
  }

  @media screen and (max-width: 1200px) {
    .list-wrap {
      li {
        .asset-base-info {
          width: 2rem;
        }
        .circulation-network {
          div {
            margin-top: 0;
          }
        }
        .el-checkbox {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
