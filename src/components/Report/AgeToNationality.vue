<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">年齡層與國籍交叉分析表</h3>

    <!-- ★★★ 新增: 篩選器區域 ★★★ -->
    <div class="flex align-items-center gap-3 mb-3">
      <label for="date-range" class="font-bold white-space-nowrap"
        >日期區間:</label
      >
      <div class="flex-grow-1">
        <Calendar
          id="date-range"
          v-model="dateRange"
          selectionMode="range"
          :manualInput="false"
          dateFormat="yy/mm/dd"
          placeholder="請選擇開始至結束日期"
          class="w-full"
        />
      </div>
      <label for="staff-select" class="font-bold white-space-nowrap"
        >工作人員:</label
      >
      <div class="flex-grow-1">
        <MultiSelect
          id="staff-select"
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
      <Button
        label="查詢"
        icon="pi pi-search"
        @click="fetchData"
        :loading="isLoading"
        :disabled="isQueryDisabled"
      />
    </div>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- ★★★ 可讀性優化: 為 DataTable 添加 class ★★★ -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm readable-table"
      >
        <!-- 固定欄位: 年齡層 -->
        <Column
          field="ageGroupName"
          header="年齡層"
          style="min-width: 100px"
          frozen
          class="font-bold"
        ></Column>

        <!-- 動態欄位 -->
        <Column
          v-for="col in dynamicColumns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          bodyClass="text-center"
          :sortable="true"
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

        <!-- Footer -->
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
          <div class="text-center p-4">請選擇篩選條件後點擊查詢。</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
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
interface Staff {
  name: string;
  fullName: string;
}

// --- 響應式狀態 ---
const tableData = ref<TableRow[]>([]);
const totalRowData = ref<TableRow | null>(null);
const dynamicColumns = ref<DynamicColumn[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// 篩選器狀態
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

// --- 輔助函式 ---
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const getFooterValue = (field: string): string => {
  if (!totalRowData.value) return "";
  const value = totalRowData.value[field];
  return value !== null && value !== undefined ? String(value) : "";
};

// --- API 呼叫 ---
const fetchStaffList = async () => {
  try {
    const response = await apiHandler.get("/option/workers");
    if (response.data && response.data.success) {
      staffList.value = response.data.data;
    }
  } catch (err) {
    console.error("獲取工作人員列表失敗:", err);
  }
};

const fetchData = async () => {
  if (isQueryDisabled.value) return;
  isLoading.value = true;
  error.value = null;
  tableData.value = [];
  dynamicColumns.value = [];
  totalRowData.value = null;

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
    const response = await apiHandler.get("/report/general/ageToNationality", {
      params,
    });
    const responseData = response.data;

    if (responseData && responseData.success) {
      const originalData: ApiNationalityData[] = responseData.data || [];
      const meta = responseData.meta;

      // 如果沒有資料，直接返回
      if (!originalData || originalData.length === 0) {
        return;
      }

      // 資料處理邏輯 (與您原版一致)
      dynamicColumns.value = originalData.map((nat) => ({
        field: nat.nationalityName,
        header: nat.nationalityName,
      }));

      const pivotedData: TableRow[] = [];
      const ageGroupsFromMeta = meta.columnMeta;

      ageGroupsFromMeta.forEach((ageName: string, ageIndex: number) => {
        const newRow: TableRow = {
          ageGroupName: ageName,
          total: meta.ageTotal?.[ageIndex] ?? 0,
          percentage: meta.percentageString?.[ageIndex] ?? "0.00 %",
        };
        originalData.forEach((nat) => {
          newRow[nat.nationalityName] = nat.ageGroup?.[ageIndex] ?? 0;
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
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStaffList();
});
</script>

<style scoped>
/* ★★★ 可讀性優化: 樣式調整 ★★★ */

/* 方法 1: 調整字體大小和內邊距 (Padding) */
.readable-table :deep(td),
.readable-table :deep(th) {
  /* 減小左右內邊距，爭取更多空間 */
  padding: 0.5rem 0.5rem;
  /* 稍微縮小字體 */
  font-size: 0.875rem;
}

/* 方法 2: 表頭文字自動換行 (您之前的版本已有，這裡保留並優化) */
.readable-table :deep(.p-column-title) {
  white-space: normal !important;
  word-break: break-all; /* 使用 break-all 在任何地方強制換行，更節省空間 */
  text-align: center;
}
.readable-table :deep(.p-column-header-content) {
  /* 配合換行，讓內容垂直排列 */
  display: block;
}

/* --- 原有樣式 (保留) --- */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-200);
}
:deep(.p-datatable-tfoot > tr > td.p-frozen-column) {
  background-color: var(--surface-200);
}
</style>
