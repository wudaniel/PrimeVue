<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">年齡層與國籍交叉分析表</h3>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 
      ★ 主要修改 1: 合併成單一 DataTable ★
      我們不再需要第二個表格，而是使用 ColumnGroup 的 footer 功能來顯示合計行。
      這可以確保欄位寬度完美對齊。
    -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
      >
        <!-- 固定欄位: 年齡層 -->
        <Column
          field="ageGroupName"
          header="年齡層"
          style="min-width: 120px"
          frozen
          class="font-bold"
        ></Column>

        <!-- ★ 主要修改 2: 動態欄位加上寬度限制與換行樣式 ★ -->
        <Column
          v-for="col in dynamicColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          bodyClass="text-center"
          :sortable="true"
          headerClass="wrappable-header"
          style="max-width: 150px"
        ></Column>

        <!-- 固定欄位: 合計 & 百分比 -->
        <Column
          field="total"
          header="合計"
          bodyClass="text-center"
          :sortable="true"
          class="font-bold"
        ></Column>
        <Column
          field="percentage"
          header="百分比"
          bodyClass="text-center"
          class="font-bold"
        ></Column>

        <!-- ★ 主要修改 1 (續): 使用 ColumnGroup 定義頁腳 (合計行) ★ -->
        <ColumnGroup type="footer">
          <Row>
            <Column footer="合計" :frozen="true" />
            <Column
              v-for="col in dynamicColumns"
              :key="col.field + '-footer'"
              :footer="getFooterValue(col.field)"
              class="text-center"
            />
            <Column :footer="getFooterValue('total')" class="text-center" />
            <Column
              :footer="getFooterValue('percentage')"
              class="text-center"
            />
          </Row>
        </ColumnGroup>

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

// ★ 新增 ColumnGroup 和 Row 的導入 ★
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 (無變動) ---
interface ApiNationalityData {
  nationalityID: number;
  nationalityName: string;
  ageGroup: number[];
  total: number;
}
interface TableRow {
  ageGroupName: string;
  total: number;
  percentage: string;
  [key: string]: string | number;
}
interface DynamicColumn {
  field: string;
  header: string;
}

// --- 響應式狀態 (無變動) ---
const tableData = ref<TableRow[]>([]);
const totalRowData = ref<TableRow | null>(null);
const dynamicColumns = ref<DynamicColumn[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// --- 核心資料處理與獲取 (邏輯無變動) ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/general/ageToNationality");
    const responseData = response.data;

    if (responseData && responseData.success) {
      const originalData: ApiNationalityData[] = responseData.data;
      const meta = responseData.meta;

      dynamicColumns.value = originalData.map((nat) => ({
        field: nat.nationalityName,
        header: nat.nationalityName, // 標題不再加 "籍"，避免過長
      }));

      const pivotedData: TableRow[] = [];
      const ageGroupsFromMeta = meta.columnMeta; // API 回傳的年齡層

      // 檢查 meta.ageTotal 的長度是否與 ageGroupsFromMeta 匹配
      if (meta.ageTotal.length < ageGroupsFromMeta.length) {
        console.warn("meta.ageTotal 的資料長度不足，可能導致錯誤。");
      }

      ageGroupsFromMeta.forEach((ageName: string, ageIndex: number) => {
        const newRow: TableRow = {
          ageGroupName: ageName,
          // 安全地訪問陣列
          total: meta.ageTotal[ageIndex] ?? 0,
          percentage: meta.percentageString[ageIndex] ?? "0.00 %",
        };

        originalData.forEach((nat) => {
          newRow[nat.nationalityName] = nat.ageGroup[ageIndex] ?? 0;
        });

        pivotedData.push(newRow);
      });

      tableData.value = pivotedData;

      const totalRow: TableRow = {
        ageGroupName: "合計",
        total: meta.total,
        percentage: "100.00 %",
      };
      originalData.forEach((nat) => {
        totalRow[nat.nationalityName] = nat.total;
      });

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
const getFooterValue = (field: string): string => {
  // 步驟 1: 確保 totalRowData 存在，如果不存在，直接返回空字串
  if (!totalRowData.value) {
    return "";
  }

  // 步驟 2: 從 totalRowData 中獲取對應的值
  const value = totalRowData.value[field];

  // 步驟 3: 檢查值是否為 null 或 undefined，如果是，返回空字串
  if (value === null || value === undefined) {
    return "";
  }

  // 步驟 4: ★★★ 核心 ★★★
  // 如果值存在 (包括 0, 123, "100%", 等)，將其轉換為字串並返回。
  return String(value);
};
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 讓合計行 (tfoot) 的文字加粗並給予背景色 */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-200);
}

/* 凍結欄位的頁腳也要有背景色 */
:deep(.p-datatable-tfoot > tr > td.p-frozen-column) {
  background-color: var(--surface-200);
}

/* 確保表頭容器內的元素置中 (無變動) */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}

/* 
  ★★★ 核心修正: 強制標題文字換行 ★★★ 
*/

/* 
  步驟 1: 我們需要直接鎖定標題文字所在的 span 元素 (.p-column-title)。
*/
:deep(.wrappable-header .p-column-title) {
  /* 覆寫 PrimeVue 預設的 nowrap，允許文字換行。使用 !important 確保最高優先級。 */
  white-space: normal !important;

  /* 
    使用 break-word 在長單字或 URL 內部進行換行，比 break-all 更自然，
    它會盡量在單字間換行。
  */
  word-break: break-word;

  /* 確保換行後的文字塊本身是置中的 */
  text-align: center;
}
</style>
