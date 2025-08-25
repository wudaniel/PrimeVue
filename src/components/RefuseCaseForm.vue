<template>
  <Card class="mt-4">
    <template #content>
      <div v-if="isLoading" class="text-center p-5">
        <ProgressSpinner />
        <p class="mt-2 text-color-secondary">正在載入不開案選項...</p>
      </div>
      <div v-else class="formgrid grid">
        <!-- 案號 (鎖定) -->
        <div class="field col-12 md:col-6">
          <label for="refuseCaseNumber">案號</label>
          <InputText
            id="refuseCaseNumber"
            :model-value="props.caseId"
            disabled
            class="w-full"
          />
        </div>

        <!-- 不開案原因下拉選單 (單選) -->
        <div class="field col-12 md:col-6">
          <label for="refusingReason">不開案原因</label>
          <Dropdown
            id="refusingReason"
            v-model="selectedReasonId"
            :options="reasonOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇不開案原因"
            class="w-full"
          />
        </div>

        <!-- ★★★ 新增：條件式顯示的 "其他" 欄位 ★★★ -->
        <div v-if="isOtherFieldVisible" class="field col-12">
          <label for="otherRefusingReason">請輸入詳細說明</label>
          <InputText
            id="otherRefusingReason"
            v-model="otherReasonText"
            placeholder="請輸入詳細說明"
            class="w-full"
          />
        </div>

        <!-- 提交按鈕 -->
        <div class="col-12 flex justify-content-end mt-4">
          <Button
            label="提交不開案"
            icon="pi pi-times"
            class="p-button-warning"
            @click="handleSubmit"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
// ★★★ 新增：導入 computed 和 watch ★★★
import { ref, onMounted, computed, watch } from "vue";
import { apiHandler } from "../class/apiHandler";

import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

const props = defineProps<{
  caseId: string;
  caseType: string;
}>();

const isLoading = ref(true);
const reasonOptions = ref<{ id: number; name: string }[]>([]);
const selectedReasonId = ref<number | null>(null);
const otherReasonText = ref("");

// ★★★ 新增：computed 屬性，判斷ID是否為負數 ★★★
const isOtherFieldVisible = computed(() => {
  return selectedReasonId.value !== null && selectedReasonId.value < 0;
});

// ★★★ 新增：watch 監聽器，優化使用者體驗 ★★★
watch(selectedReasonId, (newId) => {
  // 如果新選擇的 ID 不是負數，就清空 "其他" 欄位的文字
  if (newId === null || newId >= 0) {
    otherReasonText.value = "";
  }
});

onMounted(() => {
  fetchRefusingReasons();
});

const fetchRefusingReasons = async () => {
  isLoading.value = true;
  try {
    const response = await apiHandler.get("/option/refusingReasons");
    if (response.data && response.data.success) {
      reasonOptions.value = response.data.data;
    }
  } catch (error) {
    console.error("獲取不開案原因選項失敗:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = () => {
  console.log("提交不開案表單");
  console.log("案號:", props.caseId);
  console.log("選擇的原因 ID:", selectedReasonId.value);
  if (isOtherFieldVisible.value) {
    console.log("詳細說明:", otherReasonText.value);
  }
};
</script>

<style scoped>
.field > label {
  display: block;
  margin-bottom: 0.5rem;
}
</style>
