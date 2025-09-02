<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu"; // 使用 Menu 作為導航
import Toast from "primevue/toast";
import Avatar from "primevue/avatar"; // 新增導入 Avatar
import { SaveSession } from "./stores/auth"; // 確認路徑正確

import { useRouter, RouterView } from "vue-router";
const router = useRouter();
const userStore = SaveSession(); // <-- 新增獲取 userStore
const sidebarVisible = ref(false); // 控制 Sidebar 的顯示/隱藏

// 會員下拉選單
const userMenu = ref(); // 用於獲取 Menu 元件的實例
const userMenuItems = ref([
  {
    label: "用戶選項",
    items: [
      {
        label: "變更密碼",
        icon: "pi pi-key",
        command: () => {
          router.push("/user/password");
        },
      },
      {
        label: "登出",
        icon: "pi pi-sign-out",
        command: () => {
          handleLogout();
        },
      },
    ],
  },
]);

// --- **新增：觸發用戶選單的方法** ---
const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event);
};

// --- **新增：登出處理函數** ---
const handleLogout = () => {
  userStore.logout(); // 假設你的 store 有 logout 方法
  router.push("/login");
};

//sidebar 內容物
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
    label: "管理員測試",
    icon: "pi pi-lock",
    command: () => {
      router.push("/test");
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
  {
    label: "一般派案表",
    icon: "pi pi-check",
    command: () => {
      router.push("/generalAssigns");
      sidebarVisible.value = false;
    },
  },
  {
    label: "新入境紀錄表",
    command: () => {
      router.push("/arrivalRecords");
      sidebarVisible.value = false;
    },
  },
  {
    label: "一般紀錄表",
    command: () => {
      router.push("/generalRecords");
      sidebarVisible.value = false;
    },
  },
  {
    label: "報表",
    icon: "pi pi-chart-bar",
    command: () => {
      router.push("/none");
      sidebarVisible.value = false;
    },
  },
]);
</script>
<template>
  <div class="app-layout">
    <!-- 觸發按鈕 (固定在左上角) -->
    <!-- v-if="userStore.isLoggedIn" -->
    <Button
      icon="pi pi-bars"
      @click="sidebarVisible = true"
      class="p-button-secondary p-button-rounded p-button-text fixed-sidebar-button"
      aria-label="Toggle Menu"
    ></Button>
    <!-- **新增：右上角用戶選單** -->
    <div v-if="userStore.isLoggedIn" class="user-menu-corner">
      <Button
        type="button"
        class="p-button-text p-button-rounded user-menu-button"
        @click="toggleUserMenu"
        aria-haspopup="true"
        aria-controls="user_menu"
      >
        <Avatar
          :label="userStore.getUserfullname?.charAt(0) || 'U'"
          class="mr-2"
          shape="circle"
        />
        <span class="font-bold">{{ userStore.getUserfullname }}</span>
        <i class="pi pi-angle-down ml-2"></i>
      </Button>
      <Menu
        ref="userMenu"
        id="user_menu"
        :model="userMenuItems"
        :popup="true"
      />
    </div>
    <!-- **新增結束** -->
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
  <Toast />
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
/* **新增：右上角用戶選單的樣式** */
.user-menu-corner {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100; /* 層級，確保在內容之上 */
}

/* 清理 Menu 的預設邊框和背景，使其融入 Sidebar */
:deep(.p-menu) {
  width: 100%;
  border: none;
  background: transparent;
}

/* 主要內容區域的 padding */
.main-content {
  /*
    你需要根據按鈕的實際大小和位置來設定 padding。
    假設按鈕大概是 3rem x 3rem 大小，並且位於 top: 1rem, left: 1rem 的位置。
    那麼內容區域的 padding-top 和 padding-left 需要大於 (1rem + 3rem)。
    我們設定為 5rem 比較保險。
  */
  padding-top: 5rem;
  padding-left: 5rem;
  width: 100%; /* 確保它佔滿寬度 */
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
  padding-top: 4rem !important;
}
</style>
