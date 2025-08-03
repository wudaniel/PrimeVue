<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <Button
        @click="goBack"
        class="mb-4 p-button-secondary p-button-sm"
        label="返回列表"
        icon="pi pi-arrow-left"
      />
      <Button
        @click="goToAddRecord"
        class="p-button-success p-button-sm"
        label="新增紀錄"
        icon="pi pi-plus"
      />
    </div>
    <div v-if="loadingDetailData" class="text-center pa-5">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-4 text-grey">
        正在載入 ID {{ id }} (類型: {{ type }}) 的詳細資料...
      </p>
    </div>
    <div v-else-if="detailError" class="pa-5">
      <Message severity="error" :closable="false">{{ detailError }}</Message>
    </div>
    <div v-else-if="detailData && detailData.length > 0">
      <Card class="mt-3">
        <template #title> 詳細資料 (ID: {{ id }}, 類型: {{ type }}) </template>
        <template #content>
          <div class="detail-list">
            <div
              v-for="(detailItem, index) in detailData"
              :key="index"
              class="detail-list-item"
            >
              <i
                class="pi pi-circle-fill mr-2"
                style="font-size: 0.7rem; color: var(--p-primary-color)"
              ></i>
              <div class="detail-content">
                <div class="font-medium">
                  {{ detailItem.title || `資料項 ${index + 1}` }}
                </div>
                <div class="text-sm text-color-secondary">
                  {{ detailItem.description || "無描述" }}
                </div>
              </div>
              <Chip
                :label="detailItem.value || 'N/A'"
                severity="info"
                size="small"
                class="ml-auto"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div v-else class="text-center text-grey pa-5 mt-3">
      <i class="pi pi-info-circle mb-2" style="font-size: 2rem"></i>
      <p>沒有 ID {{ id }} (類型: {{ type }}) 的相關詳細資料。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
// import { useRoute, useRouter } from 'vue-router'; // 如果用 props: true, useRoute 不是必須的
import { useRouter, useRoute } from "vue-router"; // 為了 goBack 和初始獲取 params
import { apiHandler } from "../class/apiHandler"; // 確認路徑

// 導入需要的 PrimeVue 元件
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Card from "primevue/card";
import Chip from "primevue/chip"; // 假設你詳細列表用了 Chip

// 1. 接收路由參數作為 props (因為路由配置了 props: true)
const props = defineProps<{
  type: string; // 來自 URL 的 :type 參數 (例如 'general' 或 'arrival')
  id: string; // 來自 URL 的 :id 參數
}>();

const router = useRouter(); // 用於返回按鈕
const route = useRoute(); // 也可以用 route.params 訪問，但 props 更直接

// 狀態變數與你 Firstprimevue.vue 中詳細視圖部分類似
const detailData = ref<any[]>([]);
const loadingDetailData = ref(true);
const detailError = ref<string | null>(null);

// 獲取詳細資料的函數
const fetchDetailData = async (currentType: string, currentId: string) => {
  console.log(
    `AssignItemDetail: 正在獲取 type=${currentType}, id=${currentId} 的資料`,
  );
  loadingDetailData.value = true;
  detailData.value = [];
  detailError.value = null;

  try {
    // 注意：這裡的 API URL 格式需要與你 Firstprimevue.vue 中的一致
    // const apitypeMap: { [key: number]: string } = { 1: "general", 2: "arrival" };
    // const getApiTypeText = (type: number): string => apitypeMap[type] || "unknown";
    // ^^^ 這段邏輯現在不需要了，因為 props.type 直接就是 'general' 或 'arrival'

    const apiUrl = `/form/assign/${currentType}/${currentId}`;
    console.log("AssignItemDetail: 呼叫 API:", apiUrl);
    const response = await apiHandler.get(apiUrl);
    console.log("AssignItemDetail: API 回應:", response.data.data);

    // 處理 API 回應的邏輯 (與你 Firstprimevue.vue 中的 handleIdClick 內部邏輯類似)
    if (Array.isArray(response.data.data)) {
      detailData.value = response.data.data;
    } else if (
      typeof response.data.data === "object" &&
      response.data.data !== null &&
      Array.isArray(response.data.data.details)
    ) {
      detailData.value = response.data.data.details;
    } else if (
      typeof response.data.data === "object" &&
      response.data.data !== null
    ) {
      detailData.value = Object.entries(response.data.data).map(
        ([key, value]) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          description:
            typeof value === "object" ? JSON.stringify(value) : String(value),
          value:
            typeof value === "object"
              ? "..."
              : String(value).length > 50
                ? String(value).substring(0, 47) + "..."
                : String(value),
        }),
      );
    } else {
      console.warn("AssignItemDetail: 資料格式非預期");
      detailData.value = [];
      if (
        !response.data.data ||
        (Array.isArray(response.data.data) && response.data.data.length === 0)
      ) {
        detailError.value = `找不到 ID ${currentId} (類型: ${currentType}) 的資料。`;
      }
    }
    if (detailData.value.length === 0 && !detailError.value) {
      // 如果 API 成功但返回空數據
      detailError.value = `找不到 ID ${currentId} (類型: ${currentType}) 的資料。`;
    }
  } catch (err: any) {
    console.error("AssignItemDetail: 讀取詳細資料失敗:", err);
    detailError.value =
      err.response?.data?.message || err.message || "請求失敗";
  } finally {
    loadingDetailData.value = false;
  }
};

// 返回按鈕的方法
const goBack = () => {
  router.go(-1); // 返回上一頁
  // 或者 router.push('/your-list-page-path'); // 跳轉到指定的列表頁
};
// --- 修改 goToAddRecord 函數 ---
const goToAddRecord = () => {
  console.log(`準備為 ID: ${props.id} (類型: ${props.type}) 新增紀錄`);

  let targetRouteName = ""; // 目標路由的名稱

  // 根據 props.type 決定要跳轉到哪個路由名稱
  // 這些路由名稱 (AddArrivalRecord, AddGeneralRecord) 必須與你在 router/index.ts 中定義的完全一致
  if (props.type === "arrival") {
    targetRouteName = "arrivalRecords"; // <--- 修改為路由表中的 name
  } else if (props.type === "general") {
    targetRouteName = "generalRecords"; // <--- 修改為路由表中的 name
  } else {
    console.error(
      "goToAddRecord: 未知的類型，無法跳轉到新增紀錄頁面:",
      props.type,
    );
    alert("錯誤：未知的記錄類型，無法新增記錄！");
    return;
  }

  // 使用 router.push 進行跳轉
  // 將案號 (props.id) 作為查詢參數 (query parameter) `caseNumber` 傳遞
  router.push({
    name: targetRouteName, // 使用路由名稱
    query: {
      caseNumber: props.id, // 將當前詳情的 ID 作為 'caseNumber' 查詢參數
      // 目標表單頁面需要配置 props 來接收這個查詢參數
    },
  });
};
// --- 修改結束 ---

// 元件掛載時獲取數據
onMounted(() => {
  fetchDetailData(props.type, props.id);
});

// 監聽 props 變化，如果路由參數改變但元件被複用，則重新獲取數據
watch(
  () => [props.type, props.id], // 監聽一個包含 props 的陣列
  (newValues, oldValues) => {
    const [newType, newId] = newValues;
    const [oldType, oldId] = oldValues || [null, null]; // 處理 oldValues 可能為 undefined 的情況

    if (newType && newId && (newType !== oldType || newId !== oldId)) {
      console.log(
        `AssignItemDetail: Props 變化，重新獲取資料 type=${newType}, id=${newId}`,
      );
      fetchDetailData(newType, newId);
    }
  },
);
</script>

<style scoped>
/* 添加你需要的詳細頁面樣式 */
.text-grey {
  color: var(--p-text-color-secondary);
}
.pa-5 {
  padding: 1.25rem;
}
.mt-4 {
  margin-top: 1rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
/* 複製 Firstprimevue.vue 中的 .detail-list 等相關樣式過來 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.detail-list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-content-border-color);
}
.detail-list-item:last-child {
  border-bottom: none;
}
.detail-content {
  flex-grow: 1;
  margin-right: 1rem;
}
.font-medium {
  font-weight: 500;
}
.text-sm {
  font-size: 0.875rem;
}
.text-color-secondary {
  color: var(--p-text-color-secondary);
}
.ml-auto {
  margin-left: auto;
}
.mr-2 {
  margin-right: 0.5rem;
}
.mt-3 {
  margin-top: 0.75rem;
}
.flex {
  display: flex;
} /* 確保 PrimeFlex class 生效 */
.justify-content-between {
  justify-content: space-between;
}
.align-items-center {
  align-items: center;
}
.mb-4 {
  margin-bottom: 1rem;
}
</style>
