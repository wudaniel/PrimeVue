<template>
  <div class="login-container">
    <h1>登入</h1>

    <div v-if="!userStore.isLoggedIn">
      <!-- 監聽 form 的 submit 事件，這會被 Enter 鍵觸發 -->
      <form @submit.prevent="handleLogin">
        <label class="p-sr-only" for="login-username">帳號</label>
        <InputText
          id="login-username"
          v-model="username"
          placeholder="帳號"
          class="w-full"
          style="margin-bottom: 20px"
        />
        <!-- 密碼輸入框，同樣在 form 內部 -->
        <label class="p-sr-only" for="login-password">密碼</label>
        <Password
          inputId="login-password"
          v-model="password"
          placeholder="密碼"
          :feedback="false"
          toggleMask
          class="w-full"
          inputClass="w-full"
        />
        <!--
          將按鈕的 type 設為 "submit"。
          這樣當在表單內按 Enter 時，就會觸發 form 的 submit 事件。
          可以移除 @click 事件，避免重複調用 handleLogin。
        -->
        <Button
          label="登入"
          type="submit"
          class="p-button p-button-primary"
          style="margin-top: 20px"
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
import { useSessionStore } from "../stores/auth"; // 假設你 路徑是這樣
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import Password from "primevue/password";

import Button from "primevue/button";

export default {
  components: { Password, InputText, Button },
  setup() {
    const username = ref("");
    const password = ref("");

    const router = useRouter(); // 如果你有使用 Vue Router
    const userStore = useSessionStore();
    const toast = useToast();
    const handleLogin = async () => {
      const success = await userStore.login(username.value, password.value);

      if (success) {
        // 登入成功，導向到其他頁面 (例如：首頁)
        router.push("/"); // 假設你的首頁路徑是 '/'
      } else {
        toast.add({
          severity: "error", // 'success', 'info', 'warn', 'error'
          summary: "登入失敗",
          detail: "請檢查您的帳號或密碼是否正確",
          life: 3000, // 訊息顯示時間 (毫秒)
        });
      }
    };

    return {
      username,
      password,
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
