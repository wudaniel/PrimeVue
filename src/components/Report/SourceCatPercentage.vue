<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">個案來源統計表</h3>

    <!-- ★★★ 使用 PrimeFlex 實現的最終佈局 ★★★ -->
    <!-- .flex: 啟用 Flexbox -->
    <!-- .align-items-center: 垂直居中 -->
    <div class="flex align-items-center gap-3 mb-3">
      <!-- 日期區間 -->
      <label
        for="date-range"
        class="font-bold white-space-nowrap font-family:inherit"
        >日期區間:</label
      >
      <!-- .flex-grow-1: 讓此元素伸展以填滿可用空間 -->
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

      <!-- 工作人員 -->
      <label for="staff-select" class="font-bold white-space-nowrap"
        >工作人員:</label
      >
      <!-- .flex-grow-1: 讓此元素也伸展以填滿可用空間 -->
      <div class="flex-grow-1">
        <MultiSelect
          id="staff-select"
          v-model="selectedStaffIds"
          :options="staffList"
          :maxSelectedLabels="3"
          selectedItemsLabel="已選擇 {0} 項"
          optionLabel="name"
          optionValue="name"
          placeholder="可留空，預設查詢全部"
          display="chip"
          filter
          class="w-full"
        />
      </div>

      <!-- 查詢按鈕 -->
      <!-- 按鈕不需要特殊 class，它會自動保持其內容寬度 -->
      <Button
        label="查詢"
        icon="pi pi-search"
        @click="fetchData"
        :loading="isLoading"
        :disabled="isQueryDisabled"
      />
    </div>

    <!-- 狀態處理與表格部分 (完全無變動) -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        removableSort
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="text-center p-4">請選擇篩選條件後點擊查詢。</div>
        </template>
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
        <ColumnGroup type="footer" v-if="totalRowData">
          <Row>
            <Column :footer="totalRowData.name" footerStyle="width: 50%" />
            <Column
              :footer="totalRowData.total.toString()"
              footerClass="text-center"
              footerStyle="width: 25%"
            />
            <Column
              :footer="totalRowData.percentageString"
              footerClass="text-center"
              style="width: 25%"
            />
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
// <script setup> 區塊完全不需要修改，之前的版本是正確的。
import { ref, onMounted, computed } from "vue";
import { apiHandler } from "../../class/apiHandler";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
interface ApiDataRow {
  id: number;
  name: string;
  total: number;
  percentage: number;
  percentageString: string;
}
interface Staff {
  name: string;
  fullName: string;
}
const tableData = ref<ApiDataRow[]>([]);
const totalRowData = ref<ApiDataRow | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
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
const formatDate = (date: Date): string => date.toISOString().split("T")[0];
const fetchStaffList = async () => {
  try {
    const response = await apiHandler.get("/option/workers");
    if (response.data && response.data.success) {
      staffList.value = response.data.data;
    } else {
      console.error("無法獲取工作人員列表");
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
  totalRowData.value = null;
  const params: { [key: string]: any } = {};
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.dateStart = formatDate(dateRange.value[0]);
    params.dateEnd = formatDate(dateRange.value[1]);
  }
  if (selectedStaffIds.value && selectedStaffIds.value.length > 0) {
    params["workers[]"] = selectedStaffIds.value;
  }
  try {
    const response = await apiHandler.get("/report/general/sourceCat", {
      params,
    });
    const responseData = response.data;
    if (responseData && responseData.success) {
      const dataFromServer: ApiDataRow[] = responseData.data || [];
      const processedData = dataFromServer.map((item) => {
        if (item.name.includes("(")) {
          return { ...item, name: item.name.split("(")[0].trim() };
        }
        return item;
      });
      tableData.value = processedData;
      if (processedData.length > 0) {
        const totalCount = processedData.reduce(
          (sum, item) => sum + item.total,
          0,
        );
        totalRowData.value = {
          id: -999,
          name: "合計",
          total: totalCount,
          percentage: 1,
          percentageString: "100.00 %",
        };
      }
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
onMounted(() => {
  fetchStaffList();
});
</script>
<style scoped>
.flex {
  display: block;
}
.filter-grid-layout {
  display: grid;

  /*
    ★★★ 核心：定義網格的欄位藍圖 ★★★
    auto:  欄寬由內容決定 (用於標籤)
    1fr:   佔據 1 個單位的剩餘空間 (用於輸入框)
    這創建了一個 5 欄位的網格: [標籤][輸入框][標籤][輸入框][按鈕]
  */
  grid-template-columns: auto 1fr auto 1fr auto;
  align-items: center; /* 垂直居中 */
  gap: 0.75rem; /* 項目之間的間距 */
  margin-bottom: 1rem;
}

/* 確保標籤文字不換行 */
.filter-grid-layout > label {
  white-space: nowrap;
  font-weight: bold;
}

/* --- 原有樣式 (保留) --- */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-200);
}

:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
</style>
