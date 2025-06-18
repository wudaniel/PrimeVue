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
      path: "/test",
      name: "testcol",
      component: () => import("../components/testColGroup.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = SaveSession(); // 取得 authStore 實例

  // ... 你的路由守衛邏輯 ...
  if (to.meta.requiresAuth) {
    if (!(await authStore.checkstatus())) {
      // 使用 authStore 實例來訪問 store 的資料 (例如 isLoggedIn getter)
      alert("login please");
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
