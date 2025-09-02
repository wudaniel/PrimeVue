// src/main.ts (或 src/main.js)

import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"; // <-- 導入插件
import router from "./router";
import "primeicons/primeicons.css";
import Calendar from "primevue/calendar";

// --- PrimeVue v4+ 設定 (再次修改) ---
import "primeflex/primeflex.css"; // <--- 導入 PrimeFlex
// 1. 導入你選擇的預設集 (Preset)，例如 Lara
import Lara from "@primevue/themes/lara"; // 從 @primevue/themes 導入

// 2. 導入 PrimeIcons (路徑不變)
import "primeicons/primeicons.css";

import { defineRule, configure } from "vee-validate"; // 核心函數
import { required, min, confirmed } from "@vee-validate/rules";

import * as AllRules from "@vee-validate/rules"; // 導入所有內建規則 (方便)
// 或者，如果你只想用幾個特定規則，可以這樣導入：
import ToastService from "primevue/toastservice";

// import { required, email, min, max } from '@vee-validate/rules';

import { localize, setLocale } from "@vee-validate/i18n"; // 多國語言相關
import zh_TW from "@vee-validate/i18n/dist/locale/zh_TW.json"; // 導入繁體中文語言包
import "./style.css"; // <-- 確保這個路徑和檔名正確
defineRule("required", required);
defineRule("min", min);
defineRule("confirmed", confirmed);
configure({
  generateMessage: localize({
    zh_TW: {
      messages: {
        ...zh_TW.messages,
        // (可選) 自訂 confirmed 的訊息
        confirmed: "{field} 的內容必須與新密碼一致",
      },
      names: {
        oldPassword: "舊密碼",
        newPassword: "新密碼",
        newPasswordConfirmation: "確認新密碼", // '{field}' 將會是這個
      },
    },
  }),
  validateOnInput: true,
});
// 1. 定義 (註冊) 驗證規則
// 方法一：註冊所有導入的規則 (最簡單)
Object.keys(AllRules).forEach((rule) => {
  // 確保導入的是函數類型的規則
  if (typeof AllRules[rule] === "function") {
    defineRule(rule, AllRules[rule]);
  }
});
setLocale("zh_TW");

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // <-- 將插件 use 到 pinia 實例上
app.use(pinia);
app.use(PrimeVue, {
  // unstyled: true, // 確保這不是 true，或者直接移除這行以使用主題
  theme: {
    preset: Lara, // 使用導入的 Lara 預設集
    options: {
      prefix: "p",
      // darkModeSelector: '.my-dark-theme', // 可選
      // cssLayer: false // 可選
    },
  },
});
app.use(PrimeVue);
app.use(ToastService);

router.toast = app.config.globalProperties.$toast;
app.use(router); // 如果你有使用 Vue Router+

// 3. 配置 PrimeVue 使用主題預設集

app.mount("#app");
