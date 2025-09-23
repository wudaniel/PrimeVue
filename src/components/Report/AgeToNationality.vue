<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4">統計分析表</h2>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-3 text-color-secondary">正在載入統計資料...</p>
    </div>

    <div v-else-if="error" class="p-5">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <!-- 主要表格內容 -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        :rowClass="rowClass"
        size="small"
      >
        <!-- ★★★ 核心渲染邏輯: v-for 動態生成所有欄位 ★★★ -->
        <Column
          v-for="col in columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :class="columnClass(col)"
          sortable
        >
          <!-- 使用 #body 插槽來自訂儲存格樣式 -->
          <template #body="slotProps">
            <!-- 讓合計欄的數字也加粗 -->
            <strong
              v-if="col.field === 'total' || slotProps.data.meta === '合計'"
            >
              {{ getNestedValue(slotProps.data, col.field) }}
            </strong>
            <span v-else>
              {{ getNestedValue(slotProps.data, col.field) }}
            </span>
          </template>
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
import { apiHandler } from "../../class/apiHandler"; // 假設您有這個 API 處理器

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 ---
interface ColumnDefinition {
  field: string;
  header: string;
}

// --- 響應式狀態 ---
const tableData = ref<any[]>([]); // 儲存 API 回傳的 data 陣列
const columns = ref<ColumnDefinition[]>([]); // 儲存動態生成的欄位定義
const isLoading = ref(true);
const error = ref<string | null>(null);
const firstColumnHeader = ref("數據維度"); // 第一個欄位的標題，也可以從 API 獲取

// --- 輔助函式 ---
// PrimeVue 的 field 屬性可以處理簡單的巢狀路徑，但 `counts[0]` 這種格式需要手動處理
const getNestedValue = (obj: any, path: string) => {
  // 檢查是否是 counts[index] 的格式
  const match = path.match(/counts\[(\d+)\]/);
  if (match) {
    const index = parseInt(match[1], 10);
    return obj.counts[index];
  }
  // 否則直接回傳屬性值
  return obj[path];
};

// --- 核心資料處理與獲取 ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // 假設 API 端點是 '/statistics/age-by-nationality'
    // 為了演示，我們直接使用您提供的資料
    const response = await apiHandler.get("/report/AgeToNationality");
    const responseData = response.data;

    if (responseData && responseData.success) {
      // 1. 設定表格的資料來源
      tableData.value = responseData.data;

      // 2. ★★★ 動態生成欄位定義 ★★★
      const generatedColumns: ColumnDefinition[] = [];

      // a. 新增第一個固定的 "維度" 欄位 (例如：年齡分佈)
      generatedColumns.push({
        field: "meta",
        header: firstColumnHeader.value, // 這個標題也可以是動態的
      });

      // b. 根據頂層的 `meta` 陣列，遍歷生成中間的動態欄位
      responseData.meta.forEach((colMeta: any, index: number) => {
        generatedColumns.push({
          // 這是關鍵：field 指向 counts 陣列中對應的索引
          field: `counts[${index}]`,
          header: colMeta.name,
        });
      });

      // c. 新增最後兩個固定的 "總計" 欄位
      generatedColumns.push({ field: "total", header: "合計" });
      generatedColumns.push({ field: "percentageString", header: "百分比" });

      // 3. 將生成好的欄位定義賦值給 ref
      columns.value = generatedColumns;
    } else {
      throw new Error("API 回應格式不正確或請求失敗");
    }
  } catch (err: any) {
    error.value = "無法載入統計資料，請稍後再試。";
    console.error("Fetch statistics failed:", err);
  } finally {
    isLoading.value = false;
  }
};

// --- 特殊樣式函式 ---
// 給 "合計" 行加上特殊樣式
const rowClass = (data: any) => {
  if (data.meta === "合計") {
    return "font-bold bg-bluegray-100"; // 加粗並給予淡灰色背景
  }
  return "";
};

// 給 "合計" 欄加上特殊樣式
const columnClass = (col: ColumnDefinition) => {
  if (col.header === "合計") {
    return "font-bold";
  }
  return "";
};

// --- 生命週期鉤子 ---
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 為了讓合計行的樣式能覆蓋 PrimeVue 的預設樣式，我們可能需要使用 :deep */
:deep(.p-datatable .p-datatable-tbody > tr.bg-bluegray-100) {
  background-color: #f1f5f9 !important; /* 使用 !important 確保生效 */
}
</style>
