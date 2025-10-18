import axios from "axios";
import { useSessionStore } from "../stores/auth"; // 保持導入 Store Hook
import router from "../router";

// 1. 創建 Axios 實例時，先不設定 Authorization header
const apiHandler = axios.create({
  baseURL: "/api",
});

// 2. 添加請求攔截器 (Request Interceptor)
apiHandler.interceptors.request.use(
  (config) => {
    // 在攔截器內部，當請求要發送時，才去獲取 Store 實例
    const userStore = useSessionStore();
    const token = userStore.token;

    // 如果 token 存在，則添加到請求標頭
    if (token) {
      // 確保 headers 物件存在
      config.headers = config.headers || {};
      // 設定 Authorization 標頭
      config.headers.Authorization = `${token}`; // 通常是 'Bearer ' + token，根據你的後端要求調整
      // 或者如果你的 token 儲存時已經包含 'Bearer '，直接用 token 即可：
      // config.headers.Authorization = token;
    }

    // 返回修改後的請求配置
    return config;
  },
  (error) => {
    // 對請求錯誤做些什麼
    //console.error("Axios Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

// (可選) 添加回應攔截器 (Response Interceptor) - 用於處理全局錯誤，例如 401 未授權
apiHandler.interceptors.response.use(
  (response) => {
    // 對回應數據做點什麼
    return response;
  },
  (error) => {
    // 對回應錯誤做點什麼
    if (error.response && error.response.status === 401) {
      // 例如：處理未授權情況，嘗試刷新 token 或導向登入頁面
      //console.error("Unauthorized request (401):", error.response);
      const userStore = useSessionStore();
      userStore.logout(); // 假設你有登出 action
      // 可能需要導向到登入頁
      router.push("/login");
    }
    return Promise.reject(error);
  },
);

export { apiHandler };
