<template>
  <Card class="mt-4">
    <template #content>
      <div v-if="isLoading" class="text-center p-5">
        <ProgressSpinner />
        <p class="mt-2 text-color-secondary">正在載入開案選項...</p>
      </div>
      <div v-else class="formgrid grid">
        <!-- 案號 (鎖定) -->
        <div class="field col-12 md:col-6">
          <label for="caseNumber">案號</label>
          <InputText
            id="caseNumber"
            :model-value="props.caseId"
            disabled
            class="w-full"
          />
        </div>

        <!-- ★★★ 修改點：從 Select 改為 MultiSelect ★★★ -->
        <div class="field col-12 md:col-6">
          <label for="openingReason">開案原因 (可複選)</label>
          <MultiSelect
            inputId="openingReason"
            v-model="selectedReasonIds"
            :options="reasonOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇開案原因(可複選)"
            display="chip"
            class="w-full"
          />
        </div>

        <!-- "其他" 欄位 (邏輯已更新) -->
        <div v-if="isOtherFieldVisible" class="field col-12">
          <label for="otherReason">請輸入詳細說明</label>
          <InputText
            id="otherReason"
            v-model="otherReasonText"
            placeholder="請輸入詳細說明"
            class="w-full"
          />
        </div>

        <!-- 提交按鈕 -->
        <div class="col-12 flex justify-content-end mt-4">
          <!-- ★★★ 修改點：加入 loading 和 disabled 狀態 ★★★ -->
          <Button
            label="提交開案"
            icon="pi pi-check"
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
import { useRouter } from "vue-router"; // ★★★ 1. 導入 useRouter ★★★

import Card from "primevue/card";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

const toast = useToast();
const router = useRouter(); // ★★★ 2. 實例化 router ★★★

const props = defineProps<{
  caseId: string;
  caseType: string;
}>();

const isLoading = ref(true);
const isSubmitting = ref(false);
const reasonOptions = ref<{ id: number; name: string }[]>([]);
const selectedReasonIds = ref<number[]>([]);
const otherReasonText = ref("");

const isOtherFieldVisible = computed(() => {
  return selectedReasonIds.value.some((id) => id < 0);
});

watch(
  selectedReasonIds,
  (newIds) => {
    if (!newIds.some((id) => id < 0)) {
      otherReasonText.value = "";
    }
  },
  { deep: true },
);

onMounted(() => {
  fetchOpeningReasons();
});

const fetchOpeningReasons = async () => {
  isLoading.value = true;
  try {
    const response = await apiHandler.get("/option/needs");
    if (response.data && response.data.success) {
      reasonOptions.value = response.data.data;
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "載入失敗",
      detail: "無法獲取開案原因選項，請稍後再試。",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  // 1. 基本驗證
  if (selectedReasonIds.value.length === 0) {
    toast.add({
      severity: "warn",
      summary: "提示",
      detail: "請至少選擇一個開案原因",
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
    const payload = {
      reasonID: selectedReasonIds.value,
      reasonOther: otherReasonText.value,
      status: 1,
    };

    const url = `/form/assign/${props.caseType}/${props.caseId}`;
    const response = await apiHandler.patch(url, payload);

    if (response.data && response.data.success) {
      toast.add({
        severity: "success",
        summary: "成功",
        detail: "案件已成功開案！即將返回主頁...",
        life: 1500, // 縮短一點時間，因為馬上要跳轉了
      });

      // ★★★ 3. 延遲 1.5 秒後跳轉到主頁 ★★★
      setTimeout(() => {
        router.push("/"); // 跳轉到根路徑，也就是主頁
      }, 1500); // 延遲時間應與 toast 的 life 差不多或稍長
    } else {
      throw new Error(
        response.data.message || "開案失敗，但未收到詳細錯誤訊息",
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "發生未知錯誤";
    toast.add({
      severity: "error",
      summary: "提交失敗",
      detail: errorMessage,
      life: 5000,
    });
    isSubmitting.value = false; // ★★★ 錯誤時也要重置按鈕狀態 ★★★
  }
  // ★★★ finally 區塊可以移除了，因為成功時會跳轉，失敗時在 catch 處理 ★★★
};
</script>

<style scoped>
.field > label,
.field > span {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
