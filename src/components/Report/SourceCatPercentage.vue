<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">個案來源統計表</h3>

    <!-- 狀態處理 (無變動) -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- ★★★ 修改點 1: 表格容器 ★★★ -->
    <div v-else>
      <!-- 表格 1: 只用於顯示和排序純資料 -->
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
      >
        <!-- 我們為欄位定義了固定的百分比寬度，以確保兩個表格能完美對齊 -->
        <Column
          field="name"
          header="個案來源"
          :sortable="true"
          style="width: 50%"
        ></Column>
        <Column
          field="total"
          header="件數"
          bodyClass="text-center"
          :sortable="true"
          style="width: 25%"
        ></Column>
        <Column
          field="percentageString"
          header="百分比"
          bodyClass="text-center"
          style="width: 25%"
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
        <!-- 這裡的欄位定義必須和上面的表格完全一致，以確保對齊 -->
        <Column field="name" style="width: 50%"></Column>
        <Column
          field="total"
          bodyClass="text-center"
          style="width: 25%"
        ></Column>
        <Column
          field="percentageString"
          bodyClass="text-center"
          style="width: 25%"
        ></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler";

// ★★★ 修改點 2: 移除不再需要的導入 ★★★
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 (無變動) ---
interface ApiDataRow {
  id: number;
  name: string;
  total: number;
  percentage: number;
  percentageString: string;
}

// ★★★ 修改點 3: 簡化狀態，不再需要手動排序邏輯 ★★★
const tableData = ref<ApiDataRow[]>([]); // 只存放純資料
const totalRowData = ref<ApiDataRow | null>(null); // 獨立存放合計行
const isLoading = ref(true);
const error = ref<string | null>(null);

// ★★★ 修改點 4: fetchData 邏輯簡化 ★★★
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/SourceCatPercentage");
    const responseData = response.data;

    if (responseData && responseData.success) {
      const dataFromServer: ApiDataRow[] = responseData.data;

      const processedData = dataFromServer.map((item) => {
        if (item.name.includes("(")) {
          return { ...item, name: item.name.split("(")[0].trim() };
        }
        return item;
      });

      // 將純資料賦值給第一個表格
      tableData.value = processedData;

      const totalCount = processedData.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      const totalRow = {
        id: -999,
        name: "合計",
        total: totalCount,
        percentage: 1,
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

// --- 生命週期鉤子 (無變動) ---
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* ★★★ 修改點 5: 為合計表格添加特殊樣式 ★★★ */

/* 隱藏合計表格的表頭 */
:deep(.total-footer-table .p-datatable-thead) {
  display: none;
}

/* 讓合計行的文字加粗並給予背景色 */
:deep(.total-footer-table .p-datatable-tbody > tr) {
  font-weight: bold;
  background-color: var(--surface-200) !important;
}

/* 移除兩個表格之間的邊框，讓它們看起來像一體 */
:deep(.total-footer-table .p-datatable-wrapper) {
  border-top: none;
}

/* 確保表頭文字置中 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
</style>
