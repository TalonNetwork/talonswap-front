import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { useElementPlus } from "@/plugins/element-plus";
import "element-plus/lib/theme-chalk/index.css";
import { useI18n } from "@/plugins/i18n";
// import "amfe-flexible/index.js";
// import "normalize.css"; // 初始化css
// import { ElMessage } from "element-plus";
import { copys } from "./api/util";
import "./config";

setTimeout(() => {
  // 不延迟有时刷新会拿不到ethereum.selectedAddress???
  createApp(App)
    .use(router)
    .use(store)
    .use(useElementPlus)
    .use(useI18n)
    .mixin({
      methods: {
        $copy(str: string) {
          copys(str);
          this.$message({
            message: this.$t("public.public13"),
            type: "success"
          });
        }
      }
    })
    .mount("#app");
}, 500);
