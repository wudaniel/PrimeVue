import { defineStore } from "pinia";
import axios from "axios";
import { ref } from "vue";
import { userInfo } from "../class/userinfo";
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
        const response = await axios.post(
          `http://192.168.60.200:8000/login`,
          { username, password },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        ); // 呼叫後端登入 API
        console.log(response);
        console.log(response.data);
        if (response.data.token) {
          // 假設後端成功登入後返回 { token: '...' }
          this.token = `Bearer  ${response.data.token}`;
          this.isLoggedIn = true;
          this.userInfo.updateUserFullName(response.data.userfullname);
          this.userInfo.updatepermission(response.data.permission);
          // 可選：如果後端也返回使用者資訊，可以儲存
          //console.log(this.userInfo);
          // this.userInfo = response.data.userInfo;
          console.log(this.isLoggedIn);
          return true; // 登入成功
        } else {
          //console.error('Login failed: No token received')
          this.logout(); // 清除狀態
          return false; // 登入失敗
        }
      } catch (error) {
        //console.error("Login error:", error);
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
        const response_check = await axios.get(
          `http://192.168.60.200:8000/status`,
          {
            headers: {
              Authorization: this.token,
            },
          }
        );
      } catch (error) {
        this.isLoggedIn = false;
        this.token = "";
        this.userInfo.clean();
        console.error(error);
        return 0;
      }

      //console.log(this.userInfo.getUserfullname());
      //console.log(this.userInfo.getPermission());
      return 1;
    },
  },

  persist: true,
});
