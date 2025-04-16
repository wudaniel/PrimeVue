<template>
     <div class="login-container">
      <h1>登入</h1>
  
      <div v-if="!userStore.isLoggedIn">
        <form @submit.prevent="handleLogin">
          <p-inputtext v-model="username" placeholder="用戶名" class="w-full" />
<p-inputtext v-model="password" placeholder="密碼" type="password" class="w-full" />
      
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
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Password from 'primevue/password';
  import Checkbox from 'primevue/checkbox';
  import Button from 'primevue/button';
  import FloatLabel from 'primevue/floatlabel';
  import Divider from 'primevue/divider';
  import Message from 'primevue/message'; // 用於顯示錯誤/成功訊息
  
  export default {
    components: {

    InputText
  },
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
  .login-container {
    max-width: 300px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .w-full {
    width: 100%;
  }
  </style>