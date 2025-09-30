<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">各國籍歸化身份統計表</h3>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
    <div v-else>
      <!-- 表格 1: 只用於顯示和排序純資料 -->
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
      >
        <!-- 為確保兩個表格完美對齊，我們為欄位定義了固定的百分比寬度 -->
        <Column field="name" header="籍別" :sortable="true" style="width: 40%">
          <template #body="slotProps">
            <!-- 動態為國籍名稱加上 "籍"，但 "其他" 除外 -->
            <span>{{
              slotProps.data.name === "其他"
                ? "其他"
                : slotProps.data.name + "籍"
            }}</span>
          </template>
        </Column>
        <Column
          field="naturalized"
          header="已歸化"
          bodyClass="text-center"
          :sortable="true"
          style="width: 15%"
        ></Column>
        <Column
          field="not-naturalized"
          header="未歸化"
          bodyClass="text-center"
          :sortable="true"
          style="width: 15%"
        ></Column>
        <Column
          field="total"
          header="小計"
          bodyClass="text-center"
          :sortable="true"
          style="width: 15%"
        ></Column>
        <Column
          field="percentageString"
          header="百分比"
          bodyClass="text-center"
          style="width: 15%"
        ></Column>

        <template #empty>
          <div class="text-center p-4">沒有可顯示的統計資料。</div>
        </template>
      </DataTable>

      <!-- 表格 2: 只用於顯示固定的合計行 -->
      <DataTable
        v-if="totalRowData"
        :value="[totalRowData]"
        class="p-datatable-sm total-footer-table"
        showGridlines
      >
        <!-- 這裡的欄位定義必須和上面的表格完全一致 (尤其是寬度)，以確保對齊 -->
        <Column field="name" style="width: 40%"></Column>
        <Column
          field="naturalized"
          bodyClass="text-center"
          style="width: 15%"
        ></Column>
        <Column
          field="not-naturalized"
          bodyClass="text-center"
          style="width: 15%"
        ></Column>
        <Column
          field="total"
          bodyClass="text-center"
          style="width: 15%"
        ></Column>
        <Column
          field="percentageString"
          bodyClass="text-center"
          style="width: 15%"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler"; // 請確保路徑正確

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 ---
interface ApiDataRow {
  id: number;
  name: string;
  naturalized: number;
  "not-naturalized": number; // 注意：key 中有連字號，需要用引號
  total: number;
  percentage: number;
  percentageString: string;
}

// --- 響應式狀態 ---
const tableData = ref<ApiDataRow[]>([]); // 只存放純資料
const totalRowData = ref<any | null>(null); // 獨立存放合計行
const isLoading = ref(true);
const error = ref<string | null>(null);

// --- 核心資料處理與獲取 ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // 在實際應用中，您會使用真實的 API 呼叫
    const response = await apiHandler.get(
      "/report/general/nationalityToIdentity",
    ); // 假設這是您的 API 端點
    const responseData = response.data;

    if (responseData && responseData.success) {
      const originalData: ApiDataRow[] = responseData.data;

      // 將純資料賦值給第一個表格
      tableData.value = originalData;

      // ★★★ 動態計算合計值 ★★★
      const totalNaturalized = originalData.reduce(
        (sum, item) => sum + item.naturalized,
        0,
      );
      const totalNotNaturalized = originalData.reduce(
        (sum, item) => sum + item["not-naturalized"],
        0,
      );
      const grandTotal = originalData.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      // 創建合計行物件
      const totalRow = {
        name: "合計",
        naturalized: totalNaturalized,
        "not-naturalized": totalNotNaturalized,
        total: grandTotal,
        percentageString: "100.00 %",
      };

      // 將合計行資料賦值給第二個表格
      totalRowData.value = totalRow;
    } else {
      throw new Error(responseData.message || "API 回應格式不正確或請求失敗");
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "無法載入統計資料，請稍後再試。";
    console.error("載入統計資料失敗:", err);
  } finally {
    isLoading.value = false;
  }
};

// --- 生命週期鉤子 ---
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 隱藏合計表格的表頭 */
:deep(.total-footer-table .p-datatable-thead) {
  display: none;
}

/* 讓合計行的文字加粗並給予背景色 */
:deep(.total-footer-table .p-datatable-tbody > tr) {
  font-weight: bold;
  background-color: var(--surface-200) !important;
}

/* 移除兩個表格之間的頂部邊框，讓它們看起來像一個整體 */
:deep(.total-footer-table .p-datatable-wrapper) {
  border-top: none;
}

/* 確保表頭文字置中 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
</style>
