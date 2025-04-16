import { createRouter, createWebHistory } from 'vue-router';

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
      //meta: { requiresAuth: true }
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
