<template>
  <div class="not-found">
    <h1>404 - 頁面不存在</h1>
    <p>您訪問的頁面不存在。</p>

    <!-- 使用 PrimeVue 的 Button 元件 -->
    <Button
      label="立即返回首頁"
      icon="pi pi-home"
      @click="goHome"
      class="p-button-raised"
    />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import Button from "primevue/button"; // 匯入 Button 元件

const router = useRouter();

// 建立一個處理點擊事件的函式，用來導向首頁
const goHome = () => {
  router.push("/");
};

// 由於這個頁面不再有倒數計時功能，
// onMounted, onUnmounted, countdown, timer 這些都可以移除了
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 50px;
  gap: 1.5rem; /* 增加元素之間的間距 */
}
</style>
