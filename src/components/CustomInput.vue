<template>
  <div class="custom-input">
    <div class="info flex-between">
      <span>{{ label }}</span>
      <span>{{ $t("public.public12") }}{{ balance }}</span>
    </div>
    <div class="inner flex-between">
      <el-input
        class="no-border"
        :model-value="amount"
        @input="changeInput"
        @focus="customerFocus"
        placeholder="0.0"
      >
        <template #append><span @click="max">Max</span></template>
      </el-input>
      <div class="select-wrap flex-center" @click="showDialog = true">
        <template v-if="icon">
          <symbol-icon :icon="icon" />
          <span>{{ icon }}</span>
          <i class="el-icon-arrow-down"></i>
        </template>
        <template v-else>
          <span class="placeholder">{{ $t("transfer.transfer12") }}</span>
          <i class="el-icon-arrow-down"></i>
        </template>
      </div>
    </div>
    <!--<span class="error-tip" v-if="errorTip">{{ errorTip }}</span>-->
    <el-dialog
      custom-class="select-assets-dialog"
      :title="$t('transfer.transfer12')"
      :show-close="true"
      top="10vh"
      v-model="showDialog"
      @closed="searchVal = ''"
    >
      <el-input
        v-model="searchVal"
        :placeholder="$t('assets.assets8')"
      ></el-input>
      <ul class="list-wrap">
        <li
          v-for="item in list"
          :key="item.assetKey"
          :class="{
            disable_asset: selectedAsset && selectedAsset.symbol === item.symbol
          }"
          @click="changeSelect(item)"
        >
          <div class="flex-center flex-1">
            <symbol-icon :icon="item.symbol"></symbol-icon>
            <div class="asset-base-info">
              <div>
                {{ item.symbol }}
              </div>
              <span>ID: {{ item.assetKey }}</span>
            </div>
            <div class="asset-price">
              <span>{{ item.available }}</span>
              <!--<span>≈{{ item.usdPrice }}</span>-->
            </div>
          </div>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>

<script>
import SymbolIcon from "@/components/SymbolIcon.vue";
export default {
  props: {
    label: {
      type: String,
      default: ""
    },
    icon: String,
    assetList: {
      type: Array,
      default: () => []
    },
    inputVal: String,
    balance: String,
    errorTip: String,
    selectedAsset: {
      type: Object,
      default: () => null
    }
  },
  components: {
    SymbolIcon
  },
  data() {
    this.allAssetsList = [];
    return {
      amount: "",
      list: [],
      showDialog: false,
      searchVal: "",
      chooseAsset: {}
    };
  },
  watch: {
    inputVal(val) {
      this.amount = val;
    },
    searchVal(val) {
      this.filter(val);
    },
    assetList: {
      immediate: true,
      handler(val) {
        if (val && val.length) {
          this.allAssetsList = [...val];
          this.filter(this.searchVal);
        }
      }
    }
  },
  mounted() {
    // this.allAssetsList = [...this.assetList];
  },
  methods: {
    changeInput(val) {
      // this.amount = val;
      let decimals = this.chooseAsset.decimals || 0;
      let patrn = "";
      if (!decimals) {
        patrn = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
      } else {
        patrn = new RegExp(
          "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
        );
      }
      if (patrn.exec(val) || val === "") {
        this.$emit("update:inputVal", val);
      }
    },
    filter(str) {
      if (!str) {
        this.list = this.allAssetsList.filter(v => v);
      } else {
        this.list = this.allAssetsList.filter(v => {
          return (
            v.assetKey.indexOf(str) > -1 ||
            v.symbol.toUpperCase().indexOf(str.toUpperCase()) > -1
          );
        });
      }
    },
    changeSelect(asset) {
      if (!asset) return;
      this.$emit("selectAsset", asset);
      this.chooseAsset = asset;
      this.showDialog = false;
    },
    max() {
      this.$emit("max");
    },
    customerFocus() {
      this.$emit("customerFocus");
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-input {
  border: 1px solid #e3eeff;
  border-radius: 15px;
  padding: 15px 20px;
  position: relative;
  .error-tip {
    position: absolute;
    left: 0;
    top: 98px;
    font-size: 13px;
    color: #f56c6c;
  }
  .info {
    margin-bottom: 5px;
    color: #7e87c2;
    font-size: 12px;
    & span:first-child {
      font-size: 14px;
    }
  }
  .el-input {
    margin-right: 20px;
  }
  .inner {
    :deep(.el-input) {
      flex: 1;
      .el-input__inner {
        font-size: 20px;
      }
    }
  }
  .select-wrap {
    cursor: pointer;
    color: #8da9d4;
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }
    span {
      font-size: 14px;
      font-weight: 600;
      margin: 0 5px;
      color: #3a3c44;
    }
    i {
      color: #8da9d4;
    }
  }
  :deep(.el-input) {
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
  }
  :deep(.select-assets-dialog) {
    //max-width: 450px !important;
    //min-width: 360px !important;
    .el-input {
      .el-input__inner {
        border-radius: 10px;
        line-height: 45px;
        height: 45px;
      }
      margin-bottom: 15px;
    }
    .list-wrap {
      max-height: 50vh;
      overflow-y: auto;
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 66px;
        padding: 9px 0;
        cursor: pointer;
        img {
          width: 48px;
          height: 48px;
          margin-right: 15px;
        }
        .asset-base-info {
          flex: 1;
          div {
            font-size: 18px;
            font-weight: 600;
          }
          span {
            font-size: 14px;
            color: #7e87c2;
          }
        }
        .asset-price {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: right;
          span:nth-child(1) {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
          }
        }
      }
    }
  }
}

.disable_asset {
  opacity: 0.6;
  cursor: not-allowed !important;
}

@media screen and (max-width: 1200px) {
  ::v-deep .el-overlay {
    padding: 20px;
  }
}
</style>
