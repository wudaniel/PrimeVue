<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">未開案案件分析</h3>

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

    <!-- 主要內容區 (表格結構無變動) -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
      >
        <!-- 未開案原因 -->
        <Column
          field="name"
          header="未開案原因"
          style="width: 70%"
          class="reason-cell"
        ></Column>
        <!-- 案數 -->
        <Column
          field="total"
          header="案數"
          bodyClass="text-center"
          :sortable="true"
          style="width: 30%"
        ></Column>

        <!-- Footer -->
        <ColumnGroup type="footer">
          <Row>
            <Column
              footer="合計"
              footerStyle="text-align: left; padding-left: 1.5rem;"
            />
            <Column :footer="grandTotal.toString()" footerClass="text-center" />
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
// ★★★ 新增: 引入篩選器元件 ★★★
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
interface RefusingReason {
  id: number;
  listID: number;
  name: string;
  total: number;
}
interface Staff {
  name: string;
  fullName: string;
} // 新增 Staff 類型

// --- 響應式狀態 ---
const tableData = ref<RefusingReason[]>([]);
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

// 計算總計 (無變動)
const grandTotal = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.total, 0);
});

// --- API 呼叫 ---
const formatDate = (date: Date): string => date.toISOString().split("T")[0];

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

// ★★★ 修改: fetchData 函式以包含篩選參數 ★★★
const fetchData = async () => {
  if (isQueryDisabled.value) return; // 防護
  isLoading.value = true;
  error.value = null;
  tableData.value = []; // 清空舊資料

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
    const response = await apiHandler.get("/report/general/refusingReason", {
      params,
    });
    const responseData = response.data;

    if (responseData && responseData.success) {
      tableData.value = responseData.data || [];
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

// ★★★ 修改: onMounted 只獲取選項，不查詢資料 ★★★
onMounted(() => {
  fetchStaffList();
});
</script>

<style scoped>
/* 樣式無變動 */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-100);
}
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
:deep(.reason-cell) {
  white-space: normal;
  word-break: break-word;
}
</style>
