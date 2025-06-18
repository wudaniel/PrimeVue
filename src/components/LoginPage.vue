<template>
  <div class="login-container">
    <h1>登入</h1>

    <div v-if="!userStore.isLoggedIn">
      <form @submit.prevent="handleLogin">
        <InputText
          v-model="username"
          placeholder="用戶名"
          class="w-full"
          style="margin-bottom: 20px"
        />
        <!-- 對於密碼，強烈建議使用 <Password> 元件 -->
        <InputText
          v-model="password"
          placeholder="密碼"
          type="password"
          class="p-inputtext w-full"
        />
        <Button
          label="登入"
          class="p-button p-button-primary"
          @click="handleLogin"
        />
      </form>
    </div>
    <div v-else-if="userStore.isLoggedIn" id="top-right-msg">
      <i class="pi pi-check-circle" style="color: green; font-size: 24px"></i>

      <span style="font-size: 18px; color: green"
        >登入成功！歡迎{{ userStore.userInfoInstance?.getUserfullname() }}</span
      >
      <br />
      <Button
        label="登出"
        class="p-button p-button-primary"
        @click="userStore.logout()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router"; // 如果你有使用 Vue Router
import { SaveSession } from "../stores/auth"; // 假設你 路徑是這樣
import { apiHandler } from "../class/apiHandler";

import InputText from "primevue/inputtext";
import Password from "primevue/password";

import Button from "primevue/button";

export default {
  components: { Password, InputText, Button },
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
  max-width: 600px;
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
