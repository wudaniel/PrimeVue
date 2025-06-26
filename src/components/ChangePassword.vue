<template>
  <div class="flex justify-content-center align-items-center min-h-screen">
    <Card style="width: 28rem">
      <template #title>
        <div class="text-center">
          <i class="pi pi-key text-5xl text-primary mb-2"></i>
          <h3>變更密碼</h3>
          <p class="text-color-secondary text-base">用戶名: {{ username }}</p>
        </div>
      </template>

      <template #content>
        <form @submit="onSubmit">
          <div class="p-fluid flex flex-column gap-4">
            <!-- 舊密碼 -->
            <div class="field">
              <label for="oldPassword"
                >舊密碼 <span class="text-red-500">*</span></label
              >
              <Password
                id="oldPassword"
                v-model="oldPassword"
                placeholder="請輸入您的舊密碼"
                toggleMask
                :feedback="false"
                :class="{ 'p-invalid': !!oldPasswordError }"
              />
              <small class="p-error" v-if="oldPasswordError">{{
                oldPasswordError
              }}</small>
            </div>

            <!-- 新密碼 -->
            <div class="field">
              <label for="newPassword"
                >新密碼 <span class="text-red-500">*</span></label
              >
              <Password
                id="newPassword"
                v-model="newPassword"
                placeholder="至少 8 個字元"
                toggleMask
                :feedback="true"
                :class="{ 'p-invalid': !!newPasswordError }"
              />
              <small class="p-error" v-if="newPasswordError">{{
                newPasswordError
              }}</small>
            </div>

            <!-- 確認新密碼 -->
            <div class="field">
              <label for="newPasswordConfirmation"
                >確認新密碼 <span class="text-red-500">*</span></label
              >
              <Password
                id="newPasswordConfirmation"
                v-model="newPasswordConfirmation"
                placeholder="請再次輸入新密碼"
                toggleMask
                :feedback="false"
                :class="{ 'p-invalid': !!newPasswordConfirmationError }"
              />
              <small class="p-error" v-if="newPasswordConfirmationError">{{
                newPasswordConfirmationError
              }}</small>
            </div>

            <!-- 提交按鈕 -->
            <Button
              type="submit"
              label="確認變更"
              class="w-full mt-3"
              :loading="isSubmitting"
              :disabled="!meta.valid && meta.touched"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useForm, useField } from "vee-validate";
import { useToast } from "primevue/usetoast"; // 用於顯示成功/失敗提示
import { apiHandler } from "../class/apiHandler"; // 你的 apiHandler
import { SaveSession } from "../stores/auth"; // 用於獲取當前用戶名和 token

// PrimeVue Components
import Card from "primevue/card";
import Password from "primevue/password";
import Button from "primevue/button";

// --- 初始化 ---
const toast = useToast(); // 初始化 Toast 服務
const userStore = SaveSession();
const username = userStore.userData?.userfullname; // 從 store 獲取當前用戶名

// --- VeeValidate 表單設定 ---
// 使用 useForm 來管理整個表單的狀態
const { handleSubmit, errors, meta, isSubmitting } = useForm({
  // validationSchema 可以更清晰地定義規則
  validationSchema: {
    oldPassword: "required",
    newPassword: "required|min:8", // 必填且最小長度為 8
    // 使用 @fieldName 語法來進行欄位比對
    newPasswordConfirmation: "required|confirmed:@newPassword",
  },
});

// --- 為每個欄位使用 useField ---
const { value: oldPassword, errorMessage: oldPasswordError } =
  useField<string>("oldPassword");
const { value: newPassword, errorMessage: newPasswordError } =
  useField<string>("newPassword");
const {
  value: newPasswordConfirmation,
  errorMessage: newPasswordConfirmationError,
} = useField<string>("newPasswordConfirmation");

// --- 提交處理 ---
// 使用 useForm 返回的 handleSubmit 包裹你的提交邏輯
// 只有在驗證通過後，內部函數才會被執行
const onSubmit = handleSubmit(async (values) => {
  console.log("表單驗證通過，準備發送 API。表單值:", values);

  // 1. 獲取 token
  const token = userStore.getToken;
  if (!token) {
    toast.add({
      severity: "error",
      summary: "錯誤",
      detail: "未登入或登入狀態已過期，無法變更密碼。",
      life: 3000,
    });
    return;
  }

  // 2. 準備 API 路徑和請求體 (payload)
  const apiUrl = `/user/${username}/password`;
  const payload = {
    oldPassword: values.oldPassword,
    newPassword: values.newPassword,
  };
  console.log("正在發送 PUT 請求到:", apiUrl, "內容:", payload);

  // 3. 發送 PUT 請求
  try {
    const response = await apiHandler.put(apiUrl, payload, {
      headers: {
        Authorization: token,
      },
    });

    console.log("密碼變更成功:", response);
    toast.add({
      severity: "success",
      summary: "成功",
      detail: "密碼已成功變更！",
      life: 3000,
    });
    // (可選) 可以在這裡執行登出或跳轉等操作
    // userStore.logout();
    // router.push('/login');
  } catch (error: any) {
    console.error("密碼變更失敗:", error);
    // 根據後端返回的錯誤訊息顯示提示
    const errorMessage =
      error.response?.data?.message || "密碼變更失敗，請稍後再試。";
    toast.add({
      severity: "error",
      summary: "錯誤",
      detail: errorMessage,
      life: 5000,
    });
  }
});
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
.p-fluid .field > label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>
