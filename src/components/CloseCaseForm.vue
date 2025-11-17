<template>
  <Card class="mt-4">
    <template #content>
      <div v-if="isLoading" class="text-center p-5">
        <ProgressSpinner />
        <p class="mt-2 text-color-secondary">正在載入結案選項...</p>
      </div>
      <div v-else class="formgrid grid">
        <!-- 案號 (鎖定) -->
        <div class="field col-12 md:col-6">
          <label for="closeCaseNumber">案號</label>
          <InputText
            id="closeCaseNumber"
            :model-value="props.caseId"
            disabled
            class="w-full"
          />
        </div>

        <!-- 結案原因下拉選單 (單選) -->
        <div class="field col-12 md:col-6">
          <span id="closingReason-label">結案原因</span>
          <Select
            aria-labelledby="closingReason-label"
            v-model="selectedReasonId"
            :options="reasonOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇結案原因"
            class="w-full"
          />
        </div>

        <!-- ★★★ 新增：條件式顯示的 "其他" 欄位 ★★★ -->
        <div v-if="isOtherFieldVisible" class="field col-12">
          <label for="otherClosingReason">請輸入詳細說明</label>
          <InputText
            id="otherClosingReason"
            v-model="otherReasonText"
            placeholder="請輸入詳細說明"
            class="w-full"
          />
        </div>

        <!-- 提交按鈕 -->
        <div class="col-12 flex justify-content-end mt-4">
          <Button
            label="提交結案"
            icon="pi pi-save"
            class="p-button-secondary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { apiHandler } from "../class/apiHandler";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

const toast = useToast();
const router = useRouter();

const props = defineProps<{
  caseId: string;
  caseType: string;
}>();

const isLoading = ref(true);
const isSubmitting = ref(false); // ★★★ 新增：提交狀態
const reasonOptions = ref<{ id: number; name: string }[]>([]);
const selectedReasonId = ref<number | null>(null);
const otherReasonText = ref("");

const isOtherFieldVisible = computed(() => {
  return selectedReasonId.value !== null && selectedReasonId.value < 0;
});

watch(selectedReasonId, (newId) => {
  if (newId === null || newId >= 0) {
    otherReasonText.value = "";
  }
});

onMounted(() => {
  fetchClosingReasons();
});

const fetchClosingReasons = async () => {
  isLoading.value = true;
  try {
    const response = await apiHandler.get("/option/closingReasons");
    if (response.data && response.data.success) {
      reasonOptions.value = response.data.data;
    }
  } catch (error) {
    // ★★★ 使用 Toast 提示 ★★★
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法獲取結案原因選項，請稍後再試。",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

// ★★★ 完整重寫 handleSubmit 函式 ★★★
const handleSubmit = async () => {
  // 1. 基本驗證
  if (selectedReasonId.value === null) {
    toast.add({
      severity: "warn",
      summary: "提示",
      detail: "請選擇一個結案原因",
      life: 3000,
    });
    return;
  }

  if (isOtherFieldVisible.value && !otherReasonText.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "提示",
      detail: "請輸入詳細說明",
      life: 3000,
    });
    return;
  }

  isSubmitting.value = true;

  try {
    // 2. 準備 payload
    const payload = {
      reasonID: [selectedReasonId.value], // 保持格式一致性
      reasonOther: otherReasonText.value,
      status: 3, // ★★★ 關鍵點：狀態設為 3 ★★★
    };

    // 3. 定義 API 端點
    const url = `/form/assign/${props.caseType}/${props.caseId}`;

    // 4. 呼叫 API
    const response = await apiHandler.patch(url, payload);

    if (response.data && response.data.success) {
      // 5. 處理成功
      toast.add({
        severity: "success",
        summary: "成功",
        detail: "案件已成功結案！即將返回主頁...",
        life: 1500,
      });

      // 延遲後跳轉
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      throw new Error(
        response.data.message || "操作失敗，但未收到詳細錯誤訊息",
      );
    }
  } catch (error) {
    // 6. 處理失敗
    const errorMessage =
      error instanceof Error ? error.message : "發生未知錯誤";
    toast.add({
      severity: "error",
      summary: "提交失敗",
      detail: errorMessage,
      life: 5000,
    });
    isSubmitting.value = false; // 失敗時，重置按鈕狀態
  }
};
</script>

<style scoped>
.field > label {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
