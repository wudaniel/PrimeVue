import { createRouter, createWebHistory, type RouteMeta } from "vue-router";
import MainLayout from "../layout/MainLayout.vue"; // ★★★ 導入新佈局 ★★★
import { useSessionStore } from "../stores/auth";
import { addToastMessage } from "../toastServices";
function hasRequiredPermission(meta: RouteMeta): boolean {
  const userStore = useSessionStore();
  const requiredPermission = meta.requiredPermission as number | undefined;

  // 1. 如果路由沒有設定 requiredPermission，代表不需要特殊權限，直接通過
  if (requiredPermission === undefined) {
    return true;
  }

  const userPermissionStr = userStore.getPermission;

  // 2. 如果使用者沒有權限資訊 (可能未登入或資料異常)，則不通過
  if (!userPermissionStr) {
    return false;
  }

  const userPermissionNum = parseInt(userPermissionStr, 10);

  // 3. 如果使用者權限無法轉為數字，為安全起見，不通過
  if (isNaN(userPermissionNum)) {
    return false;
  }

  // 4. 核心邏輯：使用者權限等級必須小於路由要求的等級
  return userPermissionNum < requiredPermission;
}

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
      // ★★★ 父路由：使用 MainLayout ★★★
      path: "/",
      component: MainLayout,
      // 這個父路由本身也需要驗證，確保其所有子路由都被保護
      meta: { requiresAuth: true },
      children: [
        {
          // path: '' 表示當 URL 正好是父路由的 "/" 時
          path: "",
          name: "Main",
          // 確保這裡導入的是您提供的那個儀表板元件的路徑
          component: () => import("../components/Firstprimevue.vue"),
        },
        {
          path: "/arrivalAssigns",
          name: "arrivalAssigns",
          component: () => import("../components/Arrivalassigns.vue"),
          meta: {
            requiresAuth: true,
            requiredPermission: 20, // 權限資料
            usePermissionCheck: true, // ★★★ 觸發權限檢查的開關 ★★★
          },
        },
        {
          path: "/generalAssigns",
          name: "generalAssigns",
          component: () => import("../components/Generalassigns.vue"),
          meta: {
            requiresAuth: true,
            requiredPermission: 20, // 權限資料
            usePermissionCheck: true, // ★★★ 觸發權限檢查的開關 ★★★
          },
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
          component: () =>
            import("../components/Report/SourceCatPercentage.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/report/general/NationalityToIdentity",
          name: "NationalityToIdentity",
          component: () =>
            import("../components/Report/NationalityToIdentity.vue"),
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
          component: () =>
            import("../components/Report/ArrivalNationality.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/report/arrival/ServiceMethod",
          name: "ArrivalServiceMethod",
          component: () =>
            import("../components/Report/ArrivalServiceMethod.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/report/arrival/ServiceItem",
          name: "ArrivalServiceItem",
          component: () =>
            import("../components/Report/ArrivalServiceItem.vue"),
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
    },
  ],
});

router.beforeEach(async (to) => {
  const userStore = useSessionStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const isAuthenticated = await userStore.checkstatus();

  // 1. 檢查是否需要登入
  if (requiresAuth && !isAuthenticated) {
    return { name: "login" };
  }

  // 2. 如果已登入，但想去登入頁，導向首頁
  if (to.name === "login" && isAuthenticated) {
    return { name: "Main" };
  }

  // 3. 如果需要權限檢查，則呼叫我們的函式
  if (isAuthenticated && to.meta.usePermissionCheck) {
    if (!hasRequiredPermission(to.meta)) {
      // ★★★ 修改點：不再直接顯示 Toast，而是將訊息加入佇列 ★★★
      addToastMessage({
        severity: "error",
        summary: "權限不足",
        detail: "您沒有權限訪問此頁面，將為您導向至首頁。",
        life: 3000,
      });

      return { name: "Main" }; // 然後才重定向
    }
  }

  // 4. 所有檢查通過，允許導航
  return true;
});

export default router;
