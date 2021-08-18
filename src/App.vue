<template>
  <ElConfigProvider :locale="locale">
    <Header></Header>
    <router-view></router-view>
    <Bottom></Bottom>
  </ElConfigProvider>
</template>

<script>
import Header from "./components/Header.vue";
import Bottom from "./components/Bottom.vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import enLocale from "element-plus/lib/locale/lang/en";
import nerve from "nerve-sdk-js";
import config from "@/config";
nerve.customnet(config.chainId, config.API_URL, config.timeout); // sdk设置测试网chainId
const navigatorLang = window.navigator.language === "zh-CN" ? "zh-cn" : "en";
const lang = localStorage.getItem("lang") || navigatorLang;

export default {
  name: "App",
  data() {
    return {
      locale: lang === "zh-cn" ? zhCn : enLocale
    };
  },
  watch: {
    "$store.state.lang": {
      immediate: true,
      handler(val) {
        this.locale = val === "zh-cn" ? zhCn : enLocale;
      }
    }
  },
  components: {
    Header,
    Bottom,
    ElConfigProvider
  }
};
</script>

<style lang="scss">
@import "assets/css/base.scss";

#app {
  width: 100%;
  min-height: 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  background-image: url("assets/img/bg.jpg");
  padding-bottom: 60px;
  word-break: break-all;
}
</style>
