<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu"; // 使用 Menu 作為導航

import { useRouter, RouterView } from "vue-router";
const router = useRouter();
const sidebarVisible = ref(false); // 控制 Sidebar 的顯示/隱藏

// 替換成你實際需要的導航項目
const menuItems = ref([
  {
    label: "首頁 ",
    icon: "pi pi-fw pi-home",
    command: () => {
      // 這裡可以添加點擊後的動作，例如路由跳轉
      router.push("/");
      sidebarVisible.value = false; // 點擊後關閉 Sidebar
    },
  },
  {
    label: "登入介面",
    icon: "pi pi-lock",
    command: () => {
      router.push("/login");
      sidebarVisible.value = false;
    },
  },
  {
    label: "新入境派案表",
    icon: "pi pi-check",
    command: () => {
      router.push("/arrivalAssigns");
      sidebarVisible.value = false;
    },
  },
]);
</script>
<template>
  <div class="app-layout">
    <!-- 觸發按鈕 (固定在左上角) -->
    <Button
      icon="pi pi-bars"
      @click="sidebarVisible = true"
      class="p-button-secondary p-button-rounded p-button-text fixed-sidebar-button"
      aria-label="Toggle Menu"
    />

    <!-- Sidebar 元件 -->
    <Sidebar v-model:visible="sidebarVisible" position="left">
      <template #header>
        <h3>導覽選單</h3>
      </template>
      <!-- 使用 Menu 元件顯示導航 -->
      <Menu :model="menuItems" class="w-full" />
      <!-- 你也可以在這裡放其他 Sidebar 內容 -->
    </Sidebar>

    <!-- 主要內容區域 -->
    <div class="main-content p-4">
      <!-- 你原本的內容 START -->

      <RouterView />
      <!-- 你原本的內容 END -->

      <!-- 如果你有使用 vue-router，路由出口會放在這裡 -->
      <!-- <router-view /> -->
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  /* 可以添加整體佈局樣式 */
  position: relative;
  min-height: 100vh;
}

.fixed-sidebar-button {
  position: fixed; /* 或者使用 absolute，取決於你的佈局 */
  top: 1rem;
  left: 1rem;
  z-index: 1101; /* 需要比 Sidebar 的遮罩層(預設1100)高一點，或者比內容高 */
}

/* 清理 Menu 的預設邊框和背景，使其融入 Sidebar */
:deep(.p-menu) {
  width: 100%;
  border: none;
  background: transparent;
}

/* 讓 Sidebar 內容填滿高度 (如果需要 footer 置底) */
/* :deep(.p-sidebar-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
} */

/* 主要內容區域的 padding */
.main-content {
  padding: 1rem;
  /* 如果按鈕是 fixed，需要給內容留出空間避免被按鈕遮擋 */
  padding-top: 5rem;
  padding-left: 5rem; /* 根據按鈕大小調整 */
}

.logo-container {
  text-align: center; /* 讓 logo 居中 */
  margin-bottom: 2rem;
}

/* 你原本的 Logo 樣式 */
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
  display: inline-block; /* 確保 padding 生效 */
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vite:hover {
  /* 分開定義 vite 的 hover 效果 */
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

/* PrimeFlex 輔助類模擬 (如果沒用 PrimeFlex) */
.w-full {
  width: 100%;
}
.p-4 {
  padding: 4rem;
}
</style>
