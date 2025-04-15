<template>
    <div>
      <h1>登入測試頁面</h1>
  
      <div v-if="!userStore.isLoggedIn">
        <form @submit.prevent="handleLogin">
          <div>
            <label for="username">帳號:</label>
            <input type="text" id="username" v-model="username" />
          </div>
          <div>
            <label for="password">密碼:</label>
            <input type="password" id="password" v-model="password" />
          </div>
          <button type="submit">登入</button>
        </form>
      </div>
      <div
        v-else-if="userStore.isLoggedIn"
        id="top-right-msg"
        class="success-message"
      >
        <div>登入成功!</div>
        <button @click="userStore.logout()" type="button">登出</button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router"; // 如果你有使用 Vue Router
  import { SaveSession } from "../stores/auth"; // 假設你 路徑是這樣
  import { apiHandler } from "../class/apiHandler";
  export default {
    setup() {
      const username = ref("testuser");
      const password = ref("password");
      const loginError = ref(false);
      const router = useRouter(); // 如果你有使用 Vue Router
      const userStore = SaveSession();
  
      const handleLogin = async () => {
        loginError.value = false;
        const success = await userStore.login(username.value, password.value);
        if (success) {
          // 登入成功，導向到其他頁面 (例如：首頁)
          router.push("/"); // 假設你的首頁路徑是 '/'
        } else {
          loginError.value = true;
        }
      };
  
      return {
        username,
        password,
        loginError,
        handleLogin,
        userStore,
      };
    },
  };
  </script>
  
  <style scoped>
  .error-message {
    color: red;
    margin-bottom: 10px;
  }
  .success-message {
    color: rgb(255, 255, 255);
    margin-top: 10px;
    text-align: center; /* 將成功訊息和按鈕置中 */
  }
  .success-message > div {
    margin-bottom: 10px; /* 成功訊息文字與按鈕間距 */
  }
  form {
    display: flex;
    flex-direction: column;
    max-width: 300px;
  }
  form > div {
    margin-bottom: 10px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold; /* label 文字加粗 */
  }
  input {
    padding: 10px; /* input 內距增加 */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem; /* input 文字大小 */
  }
  button {
    padding: 12px 15px; /* button 內距增加 */
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 1rem; /* button 文字大小 */
    transition: background-color 0.2s ease-in-out; /* hover 過渡效果 */
  }
  button:hover {
    background-color: #0056b3; /* hover 時顏色變深 */
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.8; /* disabled 時稍微降低透明度 */
  }
  
  #top-right-msg {
    position: fixed; /* 固定定位，相對於 viewport */
    top: 10px; /* 距離視窗頂部 10px */
    right: 10px; /* 距離視窗右側 10px */
    background-color: rgba(0, 0, 0, 0.8); /* 淺白色背景，帶透明度 */
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    z-index: 1000; /* 確保在其他元素之上 */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); /* 可選：陰影效果 */
  }
  </style>
  