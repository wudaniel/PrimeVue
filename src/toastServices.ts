// src/services/toastService.ts

import { ref } from "vue";
import type { ToastMessageOptions } from "primevue/toast";
import type { ToastServiceMethods } from "primevue/toastservice";

// 建立一個響應式的訊息佇列 (一個 ref 陣列)
const messageQueue = ref<ToastMessageOptions[]>([]);

/**
 * 將一則訊息加入佇列。由 router.ts 或其他非元件檔案呼叫。
 * @param message - PrimeVue Toast 的訊息選項物件
 */
export function addToastMessage(message: ToastMessageOptions) {
  messageQueue.value.push(message);
}

/**
 * 處理並顯示佇列中的所有訊息。由 App.vue 呼叫。
 * @param instance - 從 useToast() 取得的本地實例
 */
export function processToastQueue(instance: ToastServiceMethods) {
  // 如果佇列是空的，就什麼都不做
  if (messageQueue.value.length === 0) {
    return;
  }

  // 遍歷所有待辦訊息並顯示它們
  messageQueue.value.forEach((message) => {
    instance.add(message);
  });

  // 清空佇列，避免重複顯示
  messageQueue.value = [];
}
