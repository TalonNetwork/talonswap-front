<template>
  <div class="swap pd_40_rd_20">
    <div class="icon-wrap flex-between">
      <div class="left click" @click="toggleExpand">
        <i class="iconfont icon-zhankai"></i>
      </div>
      <div class="right flex-center">
        <span><i class="iconfont icon-shuaxin"></i></span>
        <span><i class="iconfont icon-fenxiang"></i></span>
        <span @click="toggleSettingDialog">
          <i class="iconfont icon-shezhi"></i>
        </span>
      </div>
    </div>
    <div class="swap-area">
      <div class="from-symbol">
        <custom-input></custom-input>
      </div>
      <div class="change-direction">
        <img src="../../assets/img/swap-to.svg" alt="" />
        <span></span>
      </div>
      <div class="to-symbol">
        <custom-input></custom-input>
      </div>
      <div class="exchange-rate">
        1 BNB ≈ 2347.38 USDT
        <i class="iconfont icon-qiehuan"></i>
      </div>
      <div class="confirm-wrap">
        <el-button type="primary">{{ $t("public.public10") }}</el-button>
      </div>
    </div>
    <div class="swap-setting-info">
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading6") }}</div>
        <div class="right">3%</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading7") }}</div>
        <div class="right">0.03%</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading8") }}</div>
        <div class="right">46485.47 USDT</div>
      </div>
      <div class="info-item flex-between">
        <div class="left">{{ $t("trading.trading9") }}</div>
        <div class="right">0.00012 ETH</div>
      </div>
    </div>
    <div class="swap-route">
      <div class="name">{{ $t("trading.trading10") }}</div>
      <div class="route-network flex-center">
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">BNB</span>
          <span>&gt;</span>
        </div>
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">BUSD</span>
          <span>&gt;</span>
        </div>
        <div class="route-item">
          <div class="img"></div>
          <span class="symbol">USDT</span>
        </div>
      </div>
    </div>
    <el-dialog
      :title="$t('trading.trading11')"
      custom-class="swap-setting"
      :show-close="false"
      width="470px"
      v-model="settingDialog"
    >
      <div class="content">
        <div class="set-item">
          <div class="name">{{ $t("trading.trading12") }}</div>
          <div class="protect flex-center">
            <span class="number">0.5%</span>
            <span class="number active">1%</span>
            <span class="number">3%</span>
            <el-input />
            %
          </div>
        </div>
        <div class="set-item">
          <div class="name">{{ $t("trading.trading13") }}</div>
          <div class="minute flex-center">
            <el-input />
            {{ $t("trading.trading14") }}
          </div>
        </div>
        <div class="bottom">
          <el-button @click="toggleSettingDialog">
            {{ $t("public.public8") }}
          </el-button>
          <el-button type="primary" @click="toggleSettingDialog">
            {{ $t("public.public9") }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import CustomInput from "@/components/CustomInput.vue";
export default defineComponent({
  name: "swap",
  components: {
    CustomInput
  },
  setup(props, context) {
    const settingDialog = ref(false);
    function toggleExpand() {
      context.emit("toggleExpand");
    }
    function toggleSettingDialog() {
      settingDialog.value = !settingDialog.value;
    }
    return {
      settingDialog,
      toggleExpand,
      toggleSettingDialog
    };
  }
});
</script>

<style lang="scss" scoped>
.swap {
  width: 470px;
  height: 752px;
  padding-bottom: 30px;
  .icon-wrap {
    .left {
      width: 27px;
      height: 25px;
      i {
        font-size: 22px;
      }
    }
    .right {
      span {
        margin-left: 15px;
        cursor: pointer;
        i {
          font-size: 22px;
        }
      }
    }
  }
  .from-symbol {
    margin-top: 18px;
  }
  .change-direction {
    margin: 12px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .exchange-rate {
    margin: 20px 0;
    display: flex;
    justify-content: center;
    i {
      font-size: 16px;
      margin: 3px 0 0 5px;
      cursor: pointer;
      color: #4a5ef2;
    }
  }
  .swap-setting-info {
    border-top: 1px solid #e3eeff;
    border-bottom: 1px solid #e3eeff;
    margin-top: 40px;
    padding: 18px 0;
    .info-item {
      margin-bottom: 18px;
      &:last-child {
        margin-bottom: 0;
      }
      * {
        line-height: 1;
      }
      .left {
        color: #7e87c2;
      }
    }
  }
  .swap-route {
    .name {
      padding: 18px 0;
      color: #7e87c2;
    }
    .route-item {
      display: flex;
      align-items: center;
      flex: 1;
      .img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: red;
      }
      .symbol {
        margin: 0 10px;
      }
    }
  }
  .swap-setting {
    .content {
      .set-item {
        margin-bottom: 40px;
      }
      .name {
        margin-bottom: 10px;
      }
      .protect {
        .number {
          width: 70px;
          height: 44px;
          line-height: 44px;
          text-align: center;
          color: #4a5ef2;
          background-color: #e4e7ff;
          margin-right: 20px;
          border-radius: 15px;
          &.active {
            color: #fff;
            background-color: #4a5ef2;
          }
        }
      }
      :deep(.el-input) {
        width: 100px;
        margin-right: 3px;
        .el-input__inner {
          border-radius: 10px;
        }
      }
      .bottom {
        padding: 0 0 20px;
        :deep(.el-button) {
          width: 185px;
          height: 48px;
          border-radius: 15px;
          &:first-child {
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
