// src/main.ts (或 src/main.js)

import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import { createPinia } from "pinia";
import router from "./router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import Calendar from "primevue/calendar";

// --- PrimeVue v4+ 設定 (再次修改) ---

// 1. 導入你選擇的預設集 (Preset)，例如 Lara
import Lara from "@primevue/themes/lara"; // 從 @primevue/themes 導入

// 2. 導入 PrimeIcons (路徑不變)
import "primeicons/primeicons.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router); // 如果你有使用 Vue Router+
// 3. 配置 PrimeVue 使用主題預設集

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
app.mount("#app");
