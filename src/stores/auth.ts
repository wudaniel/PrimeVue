import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { userInfo } from "../class/userinfo";
import { apiHandler } from "../class/apiHandler";
export const SaveSession = defineStore("Session", {
  state: () => ({
    token: "", // 儲存 Session Token
    userInfo: new userInfo("", ""),
    isLoggedIn: false, // 登入狀態
  }),
  getters: {
    getToken: (state) => state.token,

    getIsLoggedIn: (state) => state.isLoggedIn,
  },
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async login(username: any, password: any) {
      try {
        const response = await apiHandler.post(
          "/login",
          { username, password },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.data.token) {
          this.token = `Bearer  ${response.data.token}`;
          this.isLoggedIn = true;
          this.userInfo.updateUserFullName(response.data.fullname);
          this.userInfo.updatepermission(response.data.permission);
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
      this.token = "";
      this.userInfo.clean();
      this.isLoggedIn = false;
      // 清除 localStorage 或 sessionStorage (pinia-plugin-persist 會自動處理)
    },
    async checkstatus() {
      try {
        //console.log(this.token);
        const response_check = await apiHandler.get("/status", {
          headers: { Authorization: this.token },
        });
        console.log(response_check);
      } catch (error) {
        this.isLoggedIn = false;
        this.token = "";
        this.userInfo.clean();
        console.error(error);
        return 0;
      }
      
      return 1;
    },
  },

  persist: true,
});
