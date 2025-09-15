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

    {
      // 路徑匹配 assigns/general/CASE123/open 這樣的格式
      path: "/assigns/:type/:id/:operation",
      // 路由名稱，必須與列表頁中使用的 'name' 完全一致
      name: "AssignOperation",

      // 指向一個能處理這三種操作的元件
      component: () => import("../components/AssignOperationView.vue"), // 或者 () => import('../views/AssignOperationView.vue')

      // 將路由參數 (:type, :id, :operation) 作為 props 傳遞給元件
      props: true,
    },
    {
      path: "/form/assign/:type/:casenumber/record/:recordid",
      name: "RecordsDetail", // 給它一個唯一的名稱，方便在程式中使用
      component: () => import("../components/RecordsDetail.vue"),
      props: true, // 這會將路由參數 :casenumber 和 :recordid 作為 props 傳入元件
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userStore = SaveSession(); // 取得 authStore 實例
  //u驗證需求
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  // 2. 如果需要驗證，但用戶未登入
  if (requiresAuth && !userStore.isLoggedIn) {
    console.log("導航守衛：需要驗證但未登入。");
    console.log("來源路由(from):", from);
    console.log("目標路由(to):", to);

    // 3. **判斷是否為初始加載**
    // from.name === undefined 且 from.path === '/' 是初始加載的一個典型特徵
    // Vue Router v4 中，初始導航時 from.name 是 undefined，from.fullPath 是 '/'
    // 另一個更可靠的判斷是 from.matched.length === 0
    const isInitialLoad = from.path === "/";

    if (isInitialLoad) {
      // **場景一：初始加載，靜默重定向**
      console.log("檢測到初始加載，靜默重定向到登入頁。");
    } else {
      // **場景二：從內部頁面導航，顯示 Toast 提示**
      console.log("從內部頁面導航，顯示 Toast 提示。");
      if (router.toast) {
        // 確保 toast 服務存在
        router.toast.add({
          severity: "warn", // 使用 warn 或 error 嚴重性
          summary: "需要驗證",
          detail: "請先登入才能訪問此頁面！",
          life: 3000,
        });
      } else {
        console.error("Toast service 未在 router 上初始化！");
      }
    }

    // 4. 重定向到登入頁
    // 可以將用戶原本想去的頁面路徑作為 query 參數傳遞，以便登入後跳轉回來
    next({
      name: "login",
    });
  } else {
    // 5. 如果不需要驗證，或者用戶已登入，則允許導航
    next();
  }
});

export default router;
