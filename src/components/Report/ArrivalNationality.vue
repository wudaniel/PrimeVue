<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">依服務方式統計表</h3>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
    <div v-else>
      <DataTable
        :value="tableData"
        showGridlines
        class="p-datatable-sm"
        responsiveLayout="scroll"
        rowGroupMode="rowspan"
        groupRowsBy="mainCategory"
      >
        <!-- ★ 複雜表頭定義 (使用 Row Grouping) ★ -->
        <Column
          header="國籍"
          field="mainCategory"
          class="font-bold fixed-col"
        ></Column>
        <Column header="性別" field="gender" class="fixed-col"></Column>

        <!-- ★ 動態生成所有國籍的資料欄位 ★ -->
        <Column
          v-for="nat in headerNationalities"
          :key="nat.id"
          :header="nat.name"
          :field="`nat_${nat.id}`"
          bodyClass="text-center"
        >
        </Column>

        <template #empty>
          <div class="text-center p-4">沒有可顯示的統計資料。</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 ---
interface ApiNationalityData {
  nationalityID: number;
  nationalityName: string;
  maleTargetNum: number;
  maleServiceNum: number;
  femaleTargetNum: number;
  femaleServiceNum: number;
  targetNum: number;
  serviceNum: number;
}

interface TableRow {
  mainCategory: string; // '人數(去重複)' 或 '人次'
  gender: string; // '男' 或 '女'
  total: number;
  [key: string]: string | number; // for nat_1, nat_2 etc.
}

interface HeaderNationality {
  id: number;
  name: string;
}

// --- 響應式狀態 ---
const tableData = ref<TableRow[]>([]);
const headerNationalities = ref<HeaderNationality[]>([]);
const footerData = ref<{ [key: string]: string | number } | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// --- 輔助函式 ---
const getFooterValue = (field: string): string => {
  if (!footerData.value) return "0";
  const value = footerData.value[field];
  return String(value || 0);
};

// --- 資料處理與獲取 ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/arrival/nationality");
    const responseData = response.data;

    if (responseData && responseData.success && responseData.data.length > 0) {
      const originalData: ApiNationalityData[] = responseData.data;

      // ★ 核心邏輯 1: 提取所有國籍列表，用於動態生成表頭 ★
      headerNationalities.value = originalData
        .map((nat) => ({
          id: nat.nationalityID,
          name: nat.nationalityName,
        }))
        .sort((a, b) => a.id - b.id); // 確保國籍順序一致

      const dataMap = new Map(
        originalData.map((item) => [item.nationalityID, item]),
      );

      // ★ 核心邏輯 2: 定義表格的靜態行結構，並指定對應的 API key ★
      const metrics = [
        {
          mainCategory: "人數",
          gender: "男",
          apiKey: "maleTargetNum" as const,
        },
        {
          mainCategory: "人數",
          gender: "女",
          apiKey: "femaleTargetNum" as const,
        },
        {
          mainCategory: "人次",
          gender: "男",
          apiKey: "maleServiceNum" as const,
        },
        {
          mainCategory: "人次",
          gender: "女",
          apiKey: "femaleServiceNum" as const,
        },
      ];

      // ★ 核心邏輯 3: 遍歷靜態行結構，從 API 資料中 "轉置" 數據進來 ★
      const processedData = metrics.map((metric) => {
        const row: TableRow = {
          mainCategory: metric.mainCategory,
          gender: metric.gender,
          total: 0,
        };

        let rowTotal = 0;
        headerNationalities.value.forEach((nat) => {
          const natData = dataMap.get(nat.id);
          // 從 API 資料中根據 apiKey 取得對應的值
          const value = natData ? natData[metric.apiKey] : 0;
          row[`nat_${nat.id}`] = value;
          rowTotal += value;
        });
        row.total = rowTotal;

        return row;
      });

      tableData.value = processedData;
    } else {
      tableData.value = [];
      error.value = responseData.message || "未能獲取統計資料或查無資料。";
    }
  } catch (err: any) {
    console.error("Error fetching report data:", err);
    error.value = err.message || "獲取資料時發生未知錯誤。";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 樣式與之前相同，可沿用 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-100);
}
:deep(.p-datatable-tfoot > tr > td.p-frozen-column) {
  background-color: var(--surface-100);
}
.fixed-col {
  background-color: var(--surface-50);
}
</style>
