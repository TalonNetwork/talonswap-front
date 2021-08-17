import { App } from "vue";
import { createI18n } from "vue-i18n";
// import {i18n as Ei18n} from "element-plus/lib/locale";
import cn from "./locales/cn";
import en from "./locales/en";
import zhLocale from "element-plus/lib/locale/lang/zh-cn";
import enLocale from "element-plus/lib/locale/lang/en";

const messages = {
  [zhLocale.name]: {
    // zh-cn
    el: zhLocale.el,
    ...cn
  },
  [enLocale.name]: {
    // en
    el: enLocale.el,
    ...en
  }
};
const navigatorLang = window.navigator.language === "zh-CN" ? "zh-cn" : "en";
const fallLang = enLocale.name;
const lang = localStorage.getItem("lang") || navigatorLang;
localStorage.setItem("lang", lang);

const i18n = createI18n({
  locale: zhLocale.name, // 默认
  fallbackLocale: fallLang, // 没有默认语言时重置为fallLang
  messages
});

// 设置element语言和国际化
// ElementLocale.use(zhLocale);
// console.log(ElementLocale, 66)
// console.log(i18n.global.t, 656)
// Ei18n(i18n.global.t);
export { i18n };
export function useI18n(app: App) {
  app.use(i18n);
}
