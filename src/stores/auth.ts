import { defineStore } from "pinia";
import { ref, computed } from "vue"; // 引入 ref 和 computed
import { userInfo } from "../class/userinfo";
import { apiHandler } from "../class/apiHandler";

// 定義 interface，保持不變
interface UserData {
  userfullname: string;
  permission: string;
  username: string;
}

// 遵循 Pinia 慣例，將 Store 命名為 use...Store
export const useSessionStore = defineStore(
  "Session",
  () => {
    // 1. State: 使用 ref() 來定義狀態
    const token = ref<string | null>(null);
    const userData = ref<UserData | null>(null);

    // 2. Getters: 使用 computed() 來定義 getters
    const userInfoInstance = computed<userInfo | null>(() => {
      if (userData.value) {
        return new userInfo(
          userData.value.userfullname,
          userData.value.permission,
          userData.value.username,
        );
      }
      return null;
    });

    const getUserfullname = computed(
      () => userData.value?.userfullname || "访客",
    );
    const getPermission = computed(() => userData.value?.permission);
    const isLoggedIn = computed(() => !!token.value && !!userData.value);
    const getToken = computed(() => token.value);

    // 3. Actions: 定義為普通的 function
    //    - 不需要使用 `this`
    //    - 訪問 state 時使用 .value
    //    - 呼叫其他 action 時直接呼叫函式名

    async function logout() {
      try {
        // 使用 await 等待 API 請求完成。
        // 在這個 await 結束前，token.value 仍然存在，
        // 所以 Axios 攔截器可以正確地抓到並附加 token。
        await apiHandler.post("/logout");
      } catch (error) {
        // 即使後端登出失敗 (例如網路斷線)，我們仍然希望在前端將使用者登出。
        // 所以在這裡可以選擇性地記錄錯誤，但不要中斷流程。
        console.error(
          "Logout API call failed, but logging out on client-side anyway.",
          error,
        );
      } finally {
        // ★ 無論成功或失敗，最後都一定要執行這裡的程式碼 ★
        // 確保客戶端的狀態被完全清除。
        token.value = null;
        userData.value = null;

        // 如果你的路由守衛依賴這個 store，
        // 清除狀態後再跳轉可以確保頁面正確重定向。
        // 例如：router.push('/login');
      }
    }

    async function login(username: string, password: string): Promise<boolean> {
      try {
        const response = await apiHandler.post<{
          data: {
            username: string;
            token: string;
            fullname: string;
            permission: string;
          };
        }>("/login", { username, password });
        if (response.data && response.data.data.token) {
          token.value = `Bearer ${response.data.data.token}`;
          userData.value = {
            userfullname: response.data.data.fullname,
            permission: response.data.data.permission,
            username: response.data.data.username,
          };
          return true;
        } else {
          logout(); // 直接呼叫函式，而不是 this.logout()
          return false;
        }
      } catch (error) {
        logout(); // 直接呼叫函式
        return false;
      }
    }

    async function checkstatus(): Promise<boolean> {
      if (!token.value) {
        logout(); // 直接呼叫函式
        return false;
      }
      try {
        const response_check = await apiHandler.get("/status", {
          headers: { Authorization: token.value },
        });
        return response_check.status >= 200 && response_check.status < 300;
      } catch (error) {
        console.error("Token 驗證失敗:", error);
        logout(); // 直接呼叫函式
        return false;
      }
    }

    // 4. 返回所有需要暴露的 state, getters, 和 actions
    return {
      token,
      userData,
      userInfoInstance,
      getUserfullname,
      getPermission,
      isLoggedIn,
      getToken,
      login,
      checkstatus,
      logout,
    };
  },
  {
    persist: [
      {
        // 指定要持久化的 state
        pick: ["token", "userData"],
        // 指定儲存方式，可以是 sessionStorage 或 localStorage
        storage: sessionStorage,
      },
    ],
  },
);
