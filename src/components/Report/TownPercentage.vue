<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">個案居住鄉鎮分析表</h3>

    <!-- ★★★ 新增: 篩選器區域 ★★★ -->
    <div class="flex align-items-center gap-3 mb-3">
      <!-- 日期區間 -->
      <label for="date-range" class="font-bold white-space-nowrap"
        >日期區間:</label
      >
      <div class="flex-grow-1">
        <DatePicker
          inputId="date-range"
          v-model="dateRange"
          selectionMode="range"
          :manualInput="false"
          dateFormat="yy/mm/dd"
          placeholder="請選擇開始至結束日期"
          class="w-full"
        />
      </div>

      <!-- 工作人員 -->
      <span id="staff-select-label" class="font-bold white-space-nowrap"
        >工作人員:</span
      >
      <div class="flex-grow-1">
        <MultiSelect
          aria-labelledby="staff-select-label"
          v-model="selectedStaffIds"
          :options="staffList"
          :maxSelectedLabels="2"
          selectedItemsLabel="已選擇 {0} 位"
          optionLabel="fullName"
          optionValue="name"
          placeholder="可留空，預設查詢全部"
          display="chip"
          filter
          class="w-full"
        />
      </div>

      <!-- 查詢按鈕 -->
      <Button
        label="查詢"
        icon="pi pi-search"
        @click="fetchData"
        :loading="isLoading"
        :disabled="isQueryDisabled"
      />
    </div>

    <!-- 狀態處理 (無變動) -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 主要內容區 (表格結構無變動) -->
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

        <template #empty>
          <div class="text-center p-4">請選擇篩選條件後點擊查詢。</div>
        </template>
      </DataTable>

      <!-- 獨立的合計行 (無變動) -->
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
import { ref, onMounted, computed } from "vue";
// @ts-ignore
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import type { DataTableSortEvent } from "primevue/datatable";
// ★★★ 新增: 引入篩選器元件 ★★★
import { DatePicker } from "primevue";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

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
interface Staff {
  name: string;
  fullName: string;
} // 新增 Staff 類型

// --- 響應式狀態 ---
const originalPureData = ref<ApiDataRow[]>([]);
const pairedTableData = ref<PairedDataRow[]>([]);
const totalRowData = ref<{ name: string; total: string } | null>(null);
const sortState = ref<{ field: string | undefined; order: 1 | -1 | undefined }>(
  {
    field: "left.total",
    order: -1,
  },
);
const isLoading = ref(false); // 初始設為 false
const error = ref<string | null>(null);

// ★★★ 新增: 篩選器相關狀態 ★★★
const dateRange = ref<Date[] | null>(null);
const staffList = ref<Staff[]>([]);
const selectedStaffIds = ref<string[] | null>(null);
const isQueryDisabled = computed(() => {
  return (
    isLoading.value ||
    !dateRange.value ||
    dateRange.value.length < 2 ||
    !dateRange.value[1]
  );
});

// --- 資料處理與排序邏輯 (完全保留，無變動) ---
const pairData = (data: ApiDataRow[]): PairedDataRow[] => {
  const midpoint = Math.ceil(data.length / 2);
  const leftColumn = data.slice(0, midpoint);
  const rightColumn = data.slice(midpoint);
  const paired: PairedDataRow[] = [];
  for (let i = 0; i < leftColumn.length; i++) {
    paired.push({ left: leftColumn[i], right: rightColumn[i] || null });
  }
  return paired;
};

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

const onSort = (event: DataTableSortEvent) => {
  sortState.value.field = event.sortField as string;
  sortState.value.order = event.sortOrder as 1 | -1 | undefined;

  // 如果取消排序
  if (!sortState.value.order || !sortState.value.field) {
    pairedTableData.value = pairData(originalPureData.value);
    return;
  }

  // 從 "left.total" 中提取出 "total"
  const baseField = sortState.value.field.split(".").pop();

  if (baseField) {
    // 傳入處理過的 baseField ("total")，並用 as 進行型別斷言
    performGlobalSort(baseField as keyof ApiDataRow, sortState.value.order);
  }
};

// --- API 呼叫 ---
// ★★★ 新增: 獲取工作人員列表的函式 ★★★
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const fetchStaffList = async () => {
  try {
    const response = await apiHandler.get("/option/workers");
    if (response.data && response.data.success) {
      staffList.value = response.data.data;
    }
  } catch (err) {}
};

// ★★★ 修改: fetchData 函式以包含篩選參數 ★★★
const fetchData = async () => {
  if (isQueryDisabled.value) return; // 防護
  isLoading.value = true;
  error.value = null;

  // 準備 API 請求參數
  const params: { [key: string]: any } = {};
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.dateStart = formatDate(dateRange.value[0]);
    params.dateEnd = formatDate(dateRange.value[1]);
  }
  if (selectedStaffIds.value && selectedStaffIds.value.length > 0) {
    params["workers[]"] = selectedStaffIds.value;
  }

  try {
    const response = await apiHandler.get("/report/general/town", {
      params,
    });
    if (response.data && response.data.success) {
      const originalData: ApiDataRow[] = response.data.data || [];
      originalPureData.value = [...originalData];

      // 應用預設排序
      if (sortState.value.order) {
        performGlobalSort("total", sortState.value.order);
      } else {
        pairedTableData.value = pairData(originalPureData.value);
      }

      // 計算合計
      if (originalData.length > 0) {
        const grandTotal = originalData.reduce(
          (sum, item) => sum + item.total,
          0,
        );
        totalRowData.value = { name: "合計", total: `${grandTotal} 案` };
      } else {
        // 如果沒有資料，清空合計行
        pairedTableData.value = [];
        totalRowData.value = null;
      }
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

// ★★★ 修改: onMounted 只獲取選項，不查詢資料 ★★★
onMounted(() => {
  fetchStaffList();
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
