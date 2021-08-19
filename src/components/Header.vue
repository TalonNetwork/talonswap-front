<template>
  <div class="w1300 header">
    <div class="left">
      <div class="logo" @click="toUrl('home')">
        <img class="fl" src="./../assets/Curium.png" />
        <!-- <span class="fl">Talon</span> -->
      </div>
      <el-menu
        class="menu"
        mode="horizontal"
        @select="handleSelect"
        :default-active="activeIndex"
        text-color="#fff"
        active-text-color="#fff"
      >
        <el-menu-item index="trading">{{ $t("header.header1") }}</el-menu-item>
        <el-menu-item index="liquidity">
          {{ $t("header.header2") }}
        </el-menu-item>
        <el-menu-item index="farm">Farm</el-menu-item>
        <!-- <el-menu-item index="info">Info</el-menu-item> -->
        <!-- <el-menu-item index="test">Test</el-menu-item> -->
      </el-menu>
      <div class="mobile-menu" @click="showMenu = !showMenu">
        <i class="iconfont icon-zhankai"></i>
      </div>
    </div>
    <div class="account-wrap">
      <div class="asset-icon" v-if="address">
        <i class="iconfont icon-qianbao" @click="toAsset"></i>
      </div>
      <div class="account">
        <!--<i class="el-icon-s-finance"></i>-->
        <div
          class="connection"
          v-if="!address"
          @click="showConnectDialog(true)"
        >
          {{ $t("header.header3") }}
        </div>
        <div v-else @click="manageAccount = true">
          {{ superLong(address, 4) }}
        </div>
      </div>
      <div class="language" @click="switchLang">{{ lang }}</div>
    </div>
    <div class="custom-overlay">
      <el-dialog
          title="Connect to a wallet"
          custom-class="connect-dialog"
          :show-close="false"
          v-model="showConnect"
          @closed="showConnectDialog(false)"
      >
        <div class="list">
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
    </div>
    <div class="custom-overlay">
      <el-dialog
        :title="$t('public.public6')"
        custom-class="account-manage"
        :show-close="false"
        v-model="manageAccount"
      >
        <div class="content">
          <div class="top">
            <span>{{ superLong(address, 9) }}</span>
            <span @click="$copy(address)">
              <i class="iconfont icon-fuzhi"></i>
            </span>
            <span @click="openUrl">
              <i
                class="iconfont icon-tiaozhuanlianjie"
                style="font-size: 29px"
              ></i>
            </span>
          </div>
          <div class="bottom tc">
            <el-button type="primary" @click="disconnectProvider">
              {{ $t("public.public7") }}
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>
    <el-drawer
      v-model="showMenu"
      custom-class="drawer-class"
      modal-class="modal_class"
      direction="ltr"
      :with-header="false"
    >
      <el-menu
        class="menu"
        @select="handleSelect"
        :default-active="activeIndex"
        active-text-color="#3171f5"
      >
        <el-menu-item index="trading">{{ $t("header.header1") }}</el-menu-item>
        <el-menu-item index="liquidity">
          {{ $t("header.header2") }}
        </el-menu-item>
        <el-menu-item index="farm">Farm</el-menu-item>
      </el-menu>
      <div class="switch_language" @click="switchLang">{{ lang }}</div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { superLong, getCurrentAccount, _networkInfo } from "@/api/util";
import useEthereum, { providerList } from "@/hooks/useEthereum";
import useLang from "@/hooks/useLang";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "Header",
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    // console.log(store, 66);
    // const showConnect = store.state.showConnect;
    const { address, chainId, initProvider, connect, disconnect } =
      useEthereum();
    // console.log(address.value, 4444)
    initProvider();
    watch(
      () => address.value,
      val => {
        if (val) {
          const currentAccount = getCurrentAccount(val);
          if (!currentAccount) {
            router.push("/login");
          }
          // console.log(currentAccount, 9999);
          store.commit("setCurrentAddress", currentAccount || {});
        }
      },
      {
        immediate: true
      }
    );
    watch(
      () => chainId.value,
      val => {
        if (val) {
          store.commit("changeChainId", val);
        }
      },
      {
        immediate: true
      }
    );
    // console.log(address, 456);
    const showMenu = ref(false);
    const manageAccount = ref(false);
    const showConnect = computed(() => store.state.showConnect);
    function showConnectDialog(state: boolean) {
      store.commit("changeConnectShow", state);
    }
    async function connectProvider(provider: string) {
      try {
        await connect(provider);
      } catch (e) {
        //
      }
      store.commit("changeConnectShow", false);
    }
    function disconnectProvider() {
      disconnect();
      manageAccount.value = false;
    }

    const activeIndex = ref("");
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
    const { lang, switchLang } = useLang();
    function openUrl() {
      const network = store.getters.chain;
      const { origin } = _networkInfo[network];
      window.open(origin + "/address/" + address.value);
    }
    return {
      address,
      showConnect,
      showConnectDialog,
      providerList,
      connectProvider,
      disconnectProvider,
      manageAccount,
      activeIndex,
      toAsset,
      lang,
      switchLang,
      openUrl,
      showMenu
    };
  },
  data() {
    return {
      account: ""
      // activeIndex: "home",
    };
  },
  mounted() {},
  methods: {
    handleSelect(key: string) {
      this.toUrl(key);
      this.showMenu = false;
    },

    superLong(str: string, len = 9) {
      return superLong(str, len);
    },

    toUrl(name: string, url = "") {
      if (url) {
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
      display: block;
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
    }
  }
  .logo {
    width: 120px;
    margin-bottom: 10px;
    cursor: pointer;
    img {
      width: 100px;
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
  .language {
    margin-left: 20px;
    color: #fff;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
  .connect-dialog {
    max-width: 470px !important;
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
    max-width: 470px;
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

.modal_class {
  top: 80px !important;
}
.mobile-menu {
  display: none;
  height: 20px;
  width: 20px;
  color: white;
}
.switch_language {
  color: #3a3c44;
  position: absolute;
  bottom: 100px;
  left: 20px;
}
.el-popup-parent--hidden {
  padding: 0 !important;
}
@media screen and (max-width: 1200px) {
  .custom-overlay {
    .el-overlay {
      padding: 20px !important;
      .el-dialog {
        margin: 15vh auto;
        width: 100% !important;
        max-width: 470px !important;
        min-width: 280px !important;
        .el-dialog__body {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
      }
    }
  }
  .header .account-manage {
    max-width: 470px !important;
    min-width: 300px;
    .content .top span {
      font-size: 22px;
      i {
        font-size: 28px;
      }
    }
  }
  .w1300 {
    //max-width: 1920px;
    height: auto;
    margin: 0;
    width: 100%;
    padding: 20px 20px 30px 20px;
  }
}
@media screen and (max-width: 610px) {
  .header .account-wrap .asset-icon i {
    font-size: 20px;
  }
  .mobile-menu {
    display: block;
    margin-right: 20px;
  }
  .header .left .menu {
    display: none;
  }
  .language {
    display: none;
  }
}
@media screen and (max-width: 375px) {
  .header .account {
    width: 90px;
    height: 30px;
    line-height: 30px;
    margin-left: 20px;
  }
}
</style>
