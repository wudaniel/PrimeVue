<template>
  <!-- 頂層路由出口 -->
  <router-view />

  <!-- 全域 Toast 元件，所有頁面共用 -->
  <Toast />
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { processToastQueue } from "./toastServices"; // 確保路徑正確

// 取得本地 Toast 實例
const toast = useToast();

// 監聽並處理來自路由守衛或其他地方的訊息佇列
watchEffect(() => {
  processToastQueue(toast);
});
</script>

<style>
/* 你可以在這裡放一些真正全域的樣式，例如 body 背景色等 */
body {
  margin: 0;
  font-family: var(--font-family); /* 假設你用了 PrimeVue 的主題變數 */
}
</style>
