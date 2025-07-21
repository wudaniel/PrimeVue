import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { userInfo } from "../class/userinfo";
import { apiHandler } from "../class/apiHandler";

// (可選但推薦) 為純數據定義一個 interface，與你的 class 屬性對應
interface UserData {
  userfullname: string;
  permission: string; // 注意：你的 class 中 permission 是 string
}

export const SaveSession = defineStore("Session", {
  state: () => ({
    token: null as string | null, // 建議初始值設為 null，更明確
    userData: null as UserData | null,
  }),
  getters: {
    // Getter 用於創建並返回 userInfo class 的實例
    // 這樣每次從 store 獲取 userInfo 時，它都是一個功能完整的 class 實例
    userInfoInstance: (state): userInfo | null => {
      if (state.userData) {
        // 使用 state 中的純數據來創建新的 class 實例
        return new userInfo(
          state.userData.userfullname,
          state.userData.permission,
        );
      }
      return null;
    },
    // 為了方便，保留舊的 getters，但讓它們依賴新的 userInfoInstance
    getUserfullname: (state) => state.userData?.userfullname || "訪客",
    getPermission: (state) => state.userData?.permission,
    isLoggedIn: (state) => !!state.token && !!state.userData,
    getToken: (state) => state.token,
  },
  actions: {
    async login(username: any, password: any) {
      try {
        const response = await apiHandler.post<{
          token: string;
          fullname: string;
          permission: string;
        }>("/login", { username, password });

        if (response.data && response.data.data.token) {
          this.token = `Bearer ${response.data.data.token}`;
          // 更新 state 中的純數據
          this.userData = {
            userfullname: response.data.data.fullname,
            permission: response.data.data.permission,
          };
          return true; // 登入成功
        } else {
          this.logout(); // 清除狀態
          return false; // 登入失敗
        }
      } catch (error) {
        this.logout(); // 清除狀態
        return false; // 登入失敗
      }
    },
    logout() {
      console.log("執行登出，清除狀態...");
      this.token = null;
      this.userData = null;
    },
    async checkstatus() {
      // 1. 先檢查本地是否有 token，沒有就直接登出並返回 false
      if (!this.token) {
        this.logout(); // 確保狀態一致
        return false;
      }

      // 2. 如果有 token，再向後端驗證
      try {
        console.log("正在驗證 token...");
        const response_check = await apiHandler.get("/status", {
          headers: { Authorization: this.token },
        });

        // 假設後端返回 200/2xx 狀態碼即表示 token 有效
        if (response_check.status >= 200 && response_check.status < 300) {
          console.log("Token 驗證成功");
          // (可選) 如果後端在 /status 回應中返回了最新的用戶資訊，可以在這裡更新
          // if (response_check.data.user) {
          //   this.userData = response_check.data.user;
          // }
          return true; // 驗證成功
        } else {
          // 雖然不太可能進入這裡 (axios 會對非 2xx 狀態拋錯)，但作為防禦
          console.warn("Token 驗證返回了非成功狀態:", response_check.status);
          this.logout();
          return false;
        }
      } catch (error) {
        // **API 請求失敗 (最常見的是 401 Unauthorized)，表示 token 無效或過期**
        console.error("Token 驗證失敗:", error);
        // **直接調用 logout action 來處理所有狀態的清除**
        this.logout();
        return false; // 驗證失敗
      }
    },
  },
  persist: {
    // 持久化插件現在只會儲存 state 中的 token 和 userData (純物件)
    paths: ["token", "userData"],
  },
});
