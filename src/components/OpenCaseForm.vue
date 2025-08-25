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

        <!-- ★★★ 修改點：從 Dropdown 改為 MultiSelect ★★★ -->
        <div class="field col-12 md:col-6">
          <label for="openingReason">開案原因 (可複選)</label>
          <MultiSelect
            id="openingReason"
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
          <Button label="提交開案" icon="pi pi-check" @click="handleSubmit" />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { apiHandler } from "../class/apiHandler";

// ★★★ 修改點：導入 MultiSelect ★★★
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

const props = defineProps<{
  caseId: string;
  caseType: string;
}>();

const isLoading = ref(true);
const reasonOptions = ref<{ id: number; name: string }[]>([]);
// ★★★ 修改點：v-model 的 ref 從單一值變為陣列 ★★★
const selectedReasonIds = ref<number[]>([]);
const otherReasonText = ref("");

// ★★★ 修改點：更新 computed 屬性，檢查陣列中是否包含負數 ★★★
const isOtherFieldVisible = computed(() => {
  // 使用 .some() 方法來檢查陣列中是否有任何一個元素小於 0
  return selectedReasonIds.value.some((id) => id < 0);
});

// ★★★ 修改點：更新 watch 監聽器，監聽陣列變化 ★★★
watch(
  selectedReasonIds,
  (newIds) => {
    // 如果新的 ID 陣列中不再包含任何負數，就清空 "其他" 欄位
    if (!newIds.some((id) => id < 0)) {
      otherReasonText.value = "";
    }
  },
  { deep: true },
); // 監聽陣列建議加上 deep: true

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
    console.error("獲取開案原因選項失敗:", error);
  } finally {
    isLoading.value = false;
  }
};

// ★★★ 修改點：更新 handleSubmit 來處理陣列資料 ★★★
const handleSubmit = () => {
  console.log("表單提交");
  console.log("案號:", props.caseId);
  console.log("選擇的原因 ID 列表:", selectedReasonIds.value);

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
