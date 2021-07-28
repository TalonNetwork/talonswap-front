import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { useElementPlus } from "@/plugins/element-plus";
import "element-plus/lib/theme-chalk/index.css";
import { useI18n } from "@/plugins/i18n";
import { ElMessage } from "element-plus";
import { copys } from "./api/util";
import "./config";

setTimeout(() => { // 不延迟有时刷新会拿不到ethereum.selectedAddress???
  createApp(App)
  .use(router)
  .use(store)
  .use(useI18n)
  .use(useElementPlus)
  .mixin({
    methods: {
      $copy(str:string) {
        copys(str);
        this.$message.warning({
          message: this.$t("public.public13"),
          type: "success"
        });
      }
    }
  })
  .mount("#app");
}, 500)


