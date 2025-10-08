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
      path: "/report/general/SourceCatPercentage",
      name: "SourceCatPercentage",
      component: () => import("../components/Report/SourceCatPercentage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/NationalityToIdentity",
      name: "NationalityToIdentity",
      component: () => import("../components/Report/NationalityToIdentity.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/TownPercentage",
      name: "TownPercentage",
      component: () => import("../components/Report/TownPercentage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/RefusingReason",
      name: "RefusingReason",
      component: () => import("../components/Report/RefusingReason.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/ClosingReason",
      name: "ClosingReason",
      component: () => import("../components/Report/ClosingReason.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/ServiceMethod",
      name: "ServiceMethod",
      component: () => import("../components/Report/ServiceMethod.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/ServiceItem",
      name: "ServiceItem",
      component: () => import("../components/Report/ServiceItem.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/ServiceSource",
      name: "ServiceSource",
      component: () => import("../components/Report/ServiceSource.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/AgeToNationality",
      name: "AgeToNationality",
      component: () => import("../components/Report/AgeToNationality.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/general/OpeningReason",
      name: "OpeningReason",
      component: () => import("../components/Report/OpeningReason.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/arrival/Nationality",
      name: "ArrivalNationality",
      component: () => import("../components/Report/ArrivalNationality.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/arrival/ServiceMethod",
      name: "ArrivalServiceMethod",
      component: () => import("../components/Report/ArrivalServiceMethod.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report/arrival/ServiceItem",
      name: "ArrivalServiceItem",
      component: () => import("../components/Report/ArrivalServiceItem.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/assigns/:type/:id/:operation",
      name: "AssignOperation",
      // 指向一個能處理這三種操作的元件
      component: () => import("../components/AssignOperationView.vue"),
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
