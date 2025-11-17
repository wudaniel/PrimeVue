<template>
  <div class="app-layout">
    <!-- 觸發按鈕 (固定在左上角) -->
    <Button
      v-if="userStore.isLoggedIn"
      icon="pi pi-bars"
      @click="sidebarVisible = true"
      class="p-button-secondary p-button-rounded p-button-text fixed-sidebar-button"
      aria-label="Toggle Menu"
    ></Button>

    <!-- 右上角用戶選單 -->
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

    <!-- Sidebar 元件 -->
    <drawer
      v-if="userStore.isLoggedIn"
      v-model:visible="sidebarVisible"
      position="left"
    >
      <template #header>
        <h3>導覽選單</h3>
      </template>
      <PanelMenu :model="menuItems" class="w-full" />
    </drawer>

    <!-- 主要內容區域 -->
    <div
      class="main-content"
      :class="{ 'logged-in-padding': userStore.isLoggedIn }"
    >
      <!-- ★★★ 這裡的 RouterView 會顯示子路由對應的元件 ★★★ -->
      <RouterView />
    </div>
  </div>
  <!-- ★★★ 注意：Toast 元件移到 App.vue 中了 ★★★ -->
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, RouterView } from "vue-router";
import { useSessionStore } from "../stores/auth";

// PrimeVue Components
import Drawer from "primevue/drawer";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Avatar from "primevue/avatar";
// @ts-ignore
import PanelMenu from "primevue/panelmenu";

const router = useRouter();
const userStore = useSessionStore();
const sidebarVisible = ref(false);

const canViewAssignForms = computed(() => {
  const permissionLevel = userStore.getPermission;
  if (permissionLevel === null || permissionLevel === undefined) {
    return false;
  }
  return Number(permissionLevel) < 20;
});

// User Menu
const userMenu = ref();
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

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event);
};

const handleLogout = async () => {
  await userStore.logout();
  router.push("/login");
};

// Sidebar Menu Items
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
  {
    label: "選項管理",
    icon: "pi pi-database",
    items: [
      {
        label: "國家",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/nationalities");
          sidebarVisible.value = false;
        },
      },
      {
        label: "轉介單位",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/sources");
          sidebarVisible.value = false;
        },
      },
      {
        label: "個案來源類別",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/sourceCats");
          sidebarVisible.value = false;
        },
      },
      {
        label: "鄉鎮市區",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/towns");
          sidebarVisible.value = false;
        },
      },
      {
        label: "服務方式",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/servicemethods");
          sidebarVisible.value = false;
        },
      },
      {
        label: "服務項目",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/serviceItems");
          sidebarVisible.value = false;
        },
      },
      {
        label: "開案原因",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/openingReason");
          sidebarVisible.value = false;
        },
      },
      {
        label: "不開案原因",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/refusingReason");
          sidebarVisible.value = false;
        },
      },
      {
        label: "結案原因",
        icon: " pi pi-list",
        command: () => {
          router.push("/options/closingreason");
          sidebarVisible.value = false;
        },
      },
    ],
  },
]);
</script>

<style scoped>
/* 將您原本 App.vue 的 <style> 內容完整複製到這裡 */
.app-layout {
  position: relative;
  min-height: 100vh;
}

.fixed-sidebar-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1101;
}

.user-menu-corner {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
}

:deep(.p-menu) {
  width: 100%;
  border: none;
  background: transparent;
}

.main-content {
  width: 100%;
  box-sizing: border-box;
}

.main-content.logged-in-padding {
  padding-top: 5rem;
  padding-left: 5rem;
  padding-right: 2rem;
}

/* ... 其他樣式 */
</style>
