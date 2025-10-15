<template>
  <div class="app-layout">
    <!-- 觸發按鈕 (固定在左上角) -->
    <!-- v-if="userStore.isLoggedIn" -->
    <Button
      v-if="userStore.isLoggedIn"
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

    <Sidebar
      v-if="userStore.isLoggedIn"
      v-model:visible="sidebarVisible"
      position="left"
    >
      <template #header>
        <h3>導覽選單</h3>
      </template>
      <!-- 使用 Menu 元件顯示導航 -->
      <panelMenu :model="menuItems" class="w-full" />
      <!-- 你也可以在這裡放其他 Sidebar 內容 -->
    </Sidebar>

    <!-- 主要內容區域 -->

    <div
      class="main-content"
      :class="{ 'logged-in-padding': userStore.isLoggedIn }"
    >
      <!-- 你原本的內容 START -->

      <RouterView />
      <!-- 你原本的內容 END -->

      <!-- 如果你有使用 vue-router，路由出口會放在這裡 -->
      <!-- <router-view /> -->
    </div>
  </div>
  <Toast />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import Menu from "primevue/menu"; // 使用 Menu 作為導航
import Toast from "primevue/toast";
import Avatar from "primevue/avatar"; // 新增導入 Avatar
import { useSessionStore } from "./stores/auth"; // 確認路徑正確
// @ts-ignore
import PanelMenu from "primevue/panelmenu";

import { useRouter, RouterView } from "vue-router";
const router = useRouter();
const userStore = useSessionStore(); // <-- 新增獲取 userStore
const sidebarVisible = ref(false); // 控制 Sidebar 的顯示/隱藏
const canViewAssignForms = computed(() => {
  const permissionLevel = userStore.getPermission;
  if (permissionLevel === null || permissionLevel === undefined) {
    return false;
  }
  // 當權限小於 20 時，回傳 true (可見)
  return Number(permissionLevel) < 20;
});
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
  userStore.logout();
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
    label: "一般派案表",
    icon: "pi pi-file",
    visible: canViewAssignForms, // 這裡會使用修正後的邏輯
    command: () => {
      router.push("/generalAssigns");
      sidebarVisible.value = false;
    },
  },
  {
    label: "一般紀錄表",
    icon: "pi pi-file",

    command: () => {
      router.push("/generalRecords");
      sidebarVisible.value = false;
    },
  },
  {
    label: "新入境派案表",
    icon: "pi pi-send",
    visible: canViewAssignForms,
    command: () => {
      router.push("/arrivalAssigns");
      sidebarVisible.value = false;
    },
  },

  {
    label: "新入境紀錄表",
    icon: "pi pi-send",
    command: () => {
      router.push("/arrivalRecords");
      sidebarVisible.value = false;
    },
  },

  {
    label: "報表",
    icon: "pi pi-chart-bar",
    items: [
      {
        label: "個案來源",
        icon: "pi pi-users",
        command: () => {
          router.push("/report/general/SourceCatPercentage");
          sidebarVisible.value = false;
        },
      },
      {
        label: "個案國籍及身份別",
        icon: "pi pi-globe",
        command: () => {
          router.push("/report/general/NationalityToIdentity");
          sidebarVisible.value = false;
        },
      },
      {
        label: "居住鄉鎮分析",
        icon: "pi pi-map-marker",
        command: () => {
          router.push("/report/general/TownPercentage");
          sidebarVisible.value = false;
        },
      },
      {
        label: "未開案案件分析",
        icon: "pi pi-folder",
        command: () => {
          router.push("/report/general/RefusingReason");
          sidebarVisible.value = false;
        },
      },
      {
        label: "結案分析",
        icon: "pi pi-folder-open",
        command: () => {
          router.push("/report/general/ClosingReason");
          sidebarVisible.value = false;
        },
      },

      {
        label: "服務方式統計",
        icon: "pi pi-sitemap",
        command: () => {
          router.push("/report/general/ServiceMethod");
          sidebarVisible.value = false;
        },
      },

      {
        label: "服務項目統計",
        icon: "pi pi-question-circle",
        command: () => {
          router.push("/report/general/ServiceItem");
          sidebarVisible.value = false;
        },
      },

      {
        label: "個案年齡層",
        icon: "pi pi-chart-line",
        command: () => {
          router.push("/report/general/AgeToNationality");
          sidebarVisible.value = false;
        },
      },
      {
        label: "服務來源與需求分析",
        icon: "pi pi-clock",
        command: () => {
          router.push("/report/general/ServiceSource");
          sidebarVisible.value = false;
        },
      },
      {
        label: "開案個案問題類型分析",
        icon: "pi pi-question-circle",
        command: () => {
          router.push("/report/general/OpeningReason");
          sidebarVisible.value = false;
        },
      },
      {
        label: "服務項目統計 (新入境)",
        icon: "pi pi-book",
        command: () => {
          router.push("/report/arrival/ServiceItem");
          sidebarVisible.value = false;
        },
      },
      {
        label: "服務方式統計 (新入境)",
        icon: "pi pi-briefcase",
        command: () => {
          router.push("/report/arrival/ServiceMethod");
          sidebarVisible.value = false;
        },
      },
      {
        label: "訪視國籍統計(新入境)",
        icon: "pi pi-calendar-plus",
        command: () => {
          router.push("/report/arrival/Nationality");
          sidebarVisible.value = false;
        },
      },
    ],
  },
]);
</script>

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
  padding: 2rem; /* 為未登入的頁面提供一個基礎的邊距 */
  width: 100%;
  box-sizing: border-box;
}
.main-content.logged-in-padding {
  padding-top: 5rem;
  padding-left: 5rem;
  padding-right: 2rem; /* 也可以微調右側 padding */
  padding-bottom: 2rem;
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
