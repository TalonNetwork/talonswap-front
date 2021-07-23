import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { useElementPlus } from "@/plugins/element-plus";
import "element-plus/lib/theme-chalk/index.css";
import { useI18n } from "@/plugins/i18n";
import "./config";

createApp(App)
  .use(router)
  .use(store)
  .use(useI18n)
  .use(useElementPlus)
  .mount("#app");
