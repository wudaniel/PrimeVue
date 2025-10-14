import { createRouter, createWebHistory } from "vue-router";

import { useSessionStore } from "../stores/auth";

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

router.beforeEach(async (to) => {
  const userStore = useSessionStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const isAuthenticated = await userStore.checkstatus();

  if (requiresAuth && !isAuthenticated) {
    // 如果頁面需要權限，但用戶未通過驗證，重定向到登入頁
    return { name: "login" };
  }

  if (to.name === "login" && isAuthenticated) {
    // 如果用戶已通過驗證，但又想去登入頁，導向首頁
    return { name: "Main" };
  }

  // 其他所有情況，允許導航
  // 可以明確地 return true，或者不寫 return (async 函式隱含返回 undefined)
  return true;
});

export default router;
