<template>
  <div class="flex justify-content-center align-items-center min-h-screen">
    <Card style="width: 28rem">
      <template #title>
        <div class="text-center">
          <i class="pi pi-key text-5xl text-primary mb-2"></i>
          <h3>變更密碼</h3>
          <p class="text-color-secondary text-base">帳號: {{ username }}</p>
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
import { useForm, useField } from "vee-validate";
import { useToast } from "primevue/usetoast"; // 用於顯示成功/失敗提示
import { apiHandler } from "../class/apiHandler"; // 你的 apiHandler
import { useSessionStore } from "../stores/auth"; // 用於獲取當前用戶名和 token

// PrimeVue Components
import Card from "primevue/card";
import Password from "primevue/password";
import Button from "primevue/button";
import { defineRule } from "vee-validate";

defineRule("required", (value: any) => {
  if (!value && value !== 0) {
    return "此欄位為必填";
  }
  return true;
});

defineRule("min", (value: string, [limit]: [number]) => {
  if (!value || value.length < limit) {
    return `此欄位至少需要 ${limit} 個字元`;
  }
  return true;
});

defineRule("confirmed", (value: string, [target]: [string]) => {
  if (value === target) {
    return true;
  }
  return "兩次輸入的密碼不一致";
});

// --- 初始化 ---
const toast = useToast(); // 初始化 Toast 服務
const userStore = useSessionStore();
const username = userStore.userData?.username; // 從 store 獲取當前用戶名

// --- VeeValidate 表單設定 ---
const { handleSubmit, meta, isSubmitting } = useForm({
  validationSchema: {
    oldPassword: "required",
    newPassword: "required|min:8",
    // ★★★ 修改點 4: 更新 `confirmed` 規則的目標欄位格式 ★★★
    // 在 validationSchema 中，目標欄位前需要加上 @ 符號
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

const onSubmit = handleSubmit(async (values) => {
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

  // 3. 發送 PUT 請求
  try {
    await apiHandler.put(apiUrl, payload, {
      headers: {
        Authorization: token,
      },
    });

    toast.add({
      severity: "success",
      summary: "成功",
      detail: "密碼已成功變更！",
      life: 3000,
    });
  } catch (error: any) {
    console.error("密碼變更失敗:", error);
    // 根據後端返回的錯誤訊息顯示提示
    toast.add({
      severity: "error",
      summary: "錯誤",
      detail: error.response.data.error.message,
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

/* ★★★ 新增這段 CSS ★★★ */
.p-error {
  color: #ef4444; /* 這是一個標準的紅色 (Tailwind Red-500) */
}
</style>
