<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">個案居住鄉鎮分析表</h3>

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
        :value="pairedTableData"
        class="p-datatable-sm"
        showGridlines
        responsiveLayout="scroll"
        removableSort
        :sort-field="sortState.field"
        :sort-order="sortState.order"
        sortMode="custom"
        @sort="onSort"
      >
        <!-- 左半邊欄位 -->
        <Column field="left.name" header="鄉鎮" style="width: 28%"></Column>
        <Column
          field="left.total"
          header="件數"
          bodyClass="text-center"
          style="width: 11%"
          sortable
        ></Column>
        <Column
          field="left.percentageString"
          header="服務個案百分比"
          bodyClass="text-center"
          style="width: 11%"
        ></Column>

        <!-- 右半邊欄位 -->
        <Column field="right.name" header="鄉鎮" style="width: 28%">
          <template #body="slotProps">
            <span v-if="slotProps.data.right">{{
              slotProps.data.right.name
            }}</span>
          </template>
        </Column>
        <Column
          field="right.total"
          header="件數"
          bodyClass="text-center"
          style="width: 11%"
          sortable
        >
          <template #body="slotProps">
            <span v-if="slotProps.data.right">{{
              slotProps.data.right.total
            }}</span>
          </template>
        </Column>
        <Column
          field="right.percentageString"
          header="服務個案百分比"
          bodyClass="text-center"
          style="width: 11%"
        >
          <template #body="slotProps">
            <span v-if="slotProps.data.right">{{
              slotProps.data.right.percentageString
            }}</span>
          </template>
        </Column>
      </DataTable>

      <!-- 獨立的合計行 -->
      <div v-if="totalRowData" class="total-footer-row grid mt-0 p-0">
        <div
          class="col-6 p-2 text-left font-bold border-right-1 surface-border"
        >
          {{ totalRowData.name }}
        </div>
        <div class="col-6 p-2 text-left font-bold">
          {{ totalRowData.total }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// @ts-ignore
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import type { DataTableSortEvent } from "primevue/datatable";

// --- 類型定義 ---
interface ApiDataRow {
  id: number;
  name: string;
  total: number;
  percentage: number;
  percentageString: string;
}
interface PairedDataRow {
  left: ApiDataRow;
  right: ApiDataRow | null;
}

// --- 響應式狀態 ---
const originalPureData = ref<ApiDataRow[]>([]);
const pairedTableData = ref<PairedDataRow[]>([]);
const totalRowData = ref<{ name: string; total: string } | null>(null);

// ★ 變更點: sortState.field 的初始值必須對應一個實際的 Column `field` 屬性
const sortState = ref<{ field: string | null; order: 1 | -1 | null }>({
  field: "left.total", // 預設讓左邊的欄位顯示排序圖示
  order: -1, // 預設降序
});
const isLoading = ref(true);
const error = ref<string | null>(null);

const pairData = (data: ApiDataRow[]): PairedDataRow[] => {
  const midpoint = Math.ceil(data.length / 2);
  const leftColumn = data.slice(0, midpoint);
  const rightColumn = data.slice(midpoint);

  const paired: PairedDataRow[] = [];
  for (let i = 0; i < leftColumn.length; i++) {
    paired.push({
      left: leftColumn[i],
      right: rightColumn[i] || null,
    });
  }
  return paired;
};

// ★ 變更點: 讓函式接收參數，使其更具通用性
const performGlobalSort = (field: keyof ApiDataRow, order: 1 | -1) => {
  const dataToSort = [...originalPureData.value];

  dataToSort.sort((a, b) => {
    const valueA = a[field];
    const valueB = b[field];

    let result = 0;
    if (valueA < valueB) result = -1;
    else if (valueA > valueB) result = 1;

    return result * order;
  });

  pairedTableData.value = pairData(dataToSort);
};

// ★★★ 核心修正點 ★★★
const onSort = (event: DataTableSortEvent) => {
  // 1. 更新 UI 狀態，讓 PrimeVue 知道要顯示哪個圖示
  //    event.sortField 現在會是 'left.total' 或 'right.total'
  sortState.value.field = event.sortField;
  sortState.value.order = event.sortOrder as 1 | -1 | null;

  // 2. 如果 sortOrder 是 null，表示使用者清除了排序，恢復原始順序
  if (sortState.value.order === null) {
    pairedTableData.value = pairData(originalPureData.value);
    return;
  }

  // 3. 從 'left.total' 或 'right.total' 中提取出我們真正要排序的基礎欄位 'total'
  //    這裡我們假設所有要全局排序的欄位都用相同的基礎名稱
  const baseField = event.sortField.split(".").pop() as keyof ApiDataRow;

  // 4. 使用基礎欄位名和排序方向，呼叫我們的全域排序函式
  if (baseField) {
    performGlobalSort(baseField, sortState.value.order);
  }
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/general/townPercentage");
    if (response.data && response.data.success) {
      const originalData: ApiDataRow[] = response.data.data;
      originalPureData.value = [...originalData];

      // ★ 變更點: 首次載入時，直接呼叫排序函式
      if (sortState.value.order) {
        performGlobalSort("total", sortState.value.order);
      } else {
        pairedTableData.value = pairData(originalPureData.value);
      }

      const grandTotal = originalData.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      totalRowData.value = { name: "合計", total: `${grandTotal} 案` };
    } else {
      throw new Error(response.data.message || "API 回應格式不正確或請求失敗");
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "無法載入統計資料。";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
.total-footer-row {
  border: 1px solid var(--surface-300);
  border-top: none;
  background-color: var(--surface-ground);
}
</style>
