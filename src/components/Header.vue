<template>
  <div class="w1300 header">
    <div class="left">
      <div class="logo" @click="toUrl('home')">
        <img class="fl" src="./../assets/Talon.svg" />
        <span class="fl">Talon</span>
      </div>
      <el-menu
        class="menu"
        mode="horizontal"
        @select="handleSelect"
        :default-active="activeIndex"
        text-color="#fff"
        active-text-color="#fff"
      >
        <el-menu-item index="trading">交易</el-menu-item>
        <el-menu-item index="liquidity">流动性</el-menu-item>
        <el-menu-item index="farm">Farm</el-menu-item>
        <el-menu-item index="info">Info</el-menu-item>
      </el-menu>
    </div>
    <div class="account-wrap">
      <div class="asset-icon">
        <i class="iconfont icon-qianbao" @click="toAsset"></i>
      </div>
      <div class="account">
        <!--<i class="el-icon-s-finance"></i>-->
        <div class="connection" v-if="!address" @click="walletDialog = true">
          连接钱包
        </div>
        <div v-else @click="manageAccount = true">
          {{ superLong(address, 4) }}
        </div>
      </div>
    </div>
    <el-dialog
      title="Connect to a wallet"
      custom-class="connect-dialog"
      :show-close="false"
      v-model="walletDialog"
    >
      <div class="list" v-if="!initialAccount">
        <div
          class="connect-btn"
          v-for="(item, index) in providerList"
          :key="index"
          @click="connectProvider(item.provider)"
        >
          {{ item.name }}
          <img class="fr" :src="item.src" alt="" />
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('public.public6')"
      custom-class="account-manage"
      :show-close="false"
      v-model="manageAccount"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, ref, watch } from "vue";
import { superLong } from "@/api/util";
import metamaskLogo from "@/assets/img/metamask.svg";
import naboxLogo from "@/assets/img/nabox-wallet.svg";
import useEthereum, { providerList } from "@/hooks/useEthereum";
import { useRouter, useRoute } from "vue-router";

export default defineComponent({
  name: "Header",
  props: {
    /*msg: {
        type: String,
        required: true
      }*/
  },
  setup() {
    const { address, chainId, provider, connect } = useEthereum();
    console.log(address, 456)
    const walletDialog = ref(false);
    const manageAccount = ref(false);

    async function connectProvider(provider: string) {
      await connect(provider);
      walletDialog.value = false;
    }
    const router = useRouter();
    const route = useRoute();
    // console.log(route, 465, route.name, route.fullPath);
    // const initaialRoute = route.name || "home";
    const activeIndex = ref("");
    // console.log(address, 456)
    watch(
      () => route.path,
      val => {
        activeIndex.value = val?.split("/")[1];
      }
    );
    function toAsset() {
      router.push({
        name: "assets"
      });
    }
    return {
      providerList,
      walletDialog,
      manageAccount,
      connectProvider,
      activeIndex,
      metamaskLogo,
      naboxLogo,
      address,
      connect,
      toAsset
    };
  },
  data() {
    return {
      account: ""
      // activeIndex: "home",
    };
  },
  mounted() {
    /* this.metamask = window.ethereum;
    if (this.metamask) {
      this.account = window.ethereum.selectedAddress;
      this.$store.dispatch("setAccount", this.account);
    } else {
      this.hasMetaMask = false;
    } */
  },
  methods: {
    handleSelect(key: string) {
      this.toUrl(key);
    },

    superLong(str: string, len = 9) {
      return superLong(str, len);
    },

    toUrl(name: string, url = "") {
      if (url) {
        //let newUrl = EXPLORER_URL + 'address/info?address=' + name;
        window.open(url);
      } else {
        this.$router.push({ name: name });
      }
    }
  }
});
</script>

<style lang="scss">
.header {
  height: 142px;
  padding-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left {
    flex: 1;
    display: flex;
    align-items: center;
    .menu {
      flex: 1;
      background-color: #3a4be1;
      border-bottom: 0;
      .el-menu-item {
        color: #ffffff;
        height: 36px;
        line-height: 36px;
        padding: 0;
        margin: 0 20px;
        &:hover,
        &:active,
        &:visited,
        &:focus {
          background: transparent;
        }
        &:hover {
          opacity: 0.65;
        }
      }
      .is-active {
        /* border-bottom: 0; */
      }
    }
  }
  .logo {
    width: 98px;
    height: 28px;
    cursor: pointer;
    img {
      width: 30px;
    }
    span {
      color: #ffffff;
      padding: 3px 0 0 5px;
      font-weight: bold;
      font-size: 16px;
    }
  }
  .account-wrap {
    display: flex;
    align-items: center;
    .asset-icon i {
      color: #fff;
      font-size: 30px;
      cursor: pointer;
    }
  }
  .account {
    width: 130px;
    height: 36px;
    margin-left: 30px;
    background: #fff;
    border-radius: 18px;
    font-size: 15px;
    cursor: pointer;
    color: #4a5ef2;
    line-height: 36px;
    text-align: center;
    &:hover {
      opacity: 0.7;
    }
  }
  .connect-dialog {
    width: 470px !important;
    .el-dialog__body {
      padding: 0;
      .list {
        padding: 0 25px 25px;
        .connect-btn {
          height: 50px;
          line-height: 50px;
          font-size: 14px;
          font-weight: 600;
          padding: 0 15px;
          margin-bottom: 15px;
          border-radius: 15px;
          background: rgb(239, 244, 245);
          cursor: pointer;
          &:hover {
            background-color: rgb(237, 238, 242);
          }
          img {
            margin-top: 7px;
            width: 35px;
            height: 35px;
          }
        }
      }
    }
  }
  .account-manage {
    width: 470px !important;
    .el-dialog__header {
      text-align: center;
    }
    .content {
      /* display: ; */
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          font-size: 24px;
        }
        i {
          color: #4a5ef2;
          font-size: 34px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 20px;
        }
      }
      .bottom {
        padding: 40px 0 20px;
        .el-button {
          width: 185px;
          height: 48px;
          border-radius: 15px;
          border: none;
        }
      }
    }
  }
}
</style>
