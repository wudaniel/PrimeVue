import { createRouter, createWebHistory } from "vue-router";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { SaveSession } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../components/LoginPage.vue"),
      //meta: { requiresAuth: true }
    },
    {
      path: "/",
      name: "Main",
      component: () => import("../components/Firstprimevue.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/arrivalAssigns",
      name: "arrivalAssigns",
      component: () => import("../components/Arrivalassigns.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/generalAssigns",
      name: "generalAssigns",
      component: () => import("../components/Generalassigns.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/arrivalRecords",
      name: "arrivalRecords",
      component: () => import("../components/Arrivalrecords.vue"),
      meta: { requiresAuth: true },
      props: (route) => ({ caseNumberQuery: route.query.caseNumber }), // 將查詢參數轉為 prop
    },
    {
      path: "/generalRecords",
      name: "generalRecords",
      component: () => import("../components/Generalrecords.vue"),
      meta: { requiresAuth: true },
      props: (route) => ({ caseNumberQuery: route.query.caseNumber }), // 將查詢參數轉為 prop
    },
    {
      path: "/assigns/:type/:id", // :type 和 :id 是「佔位符」
      name: "AssignDetail",
      component: () => import("../components/AssignItemDetail.vue"),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: "/user/password",
      name: "ChangePassword",
      component: () => import("../components/ChangePassword.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = SaveSession(); // 取得 authStore 實例

  // ... 你的路由守衛邏輯 ...
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 現在可以安全地使用 router.toast
    if (router.toast) {
      router.toast.add({
        severity: "error",
        summary: "請先登入",
        detail: "請先登入才能訪問此頁面。",
        life: 3000,
      });
    } else {
      console.error("Toast service is not available on router.");
    }
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
