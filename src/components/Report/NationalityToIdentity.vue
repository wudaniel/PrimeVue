<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">各國籍歸化身份統計表</h3>

    <!-- ★★★ 新增: 篩選器區域 ★★★ -->
    <div class="flex flex-wrap md:flex-nowrap align-items-center gap-3 mb-3">
      <!-- 日期區間 -->
      <label for="date-range" class="font-bold white-space-nowrap"
        >日期區間:</label
      >
      <div class="flex-grow-1">
        <DatePicker
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

      <!-- 性別 -->
      <label for="gender-select" class="font-bold white-space-nowrap"
        >性別:</label
      >
      <div style="min-width: 150px">
        <Dropdown
          id="gender-select"
          v-model="selectedGender"
          :options="genderOptions"
          optionLabel="name"
          optionValue="code"
          placeholder="全部"
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

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- ★★★ 修改點: 合併為單一 DataTable ★★★ -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
        removableSort
      >
        <template #empty>
          <div class="text-center p-4">請選擇篩選條件後點擊查詢。</div>
        </template>

        <!-- 資料欄位 -->
        <Column
          field="name"
          header="籍別"
          :sortable="true"
          style="width: 40%"
        ></Column>
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

        <!-- Footer -->
        <ColumnGroup type="footer" v-if="totalRowData">
          <Row>
            <Column :footer="totalRowData.name" footerStyle="width: 40%" />
            <Column
              :footer="totalRowData.naturalized"
              footerClass="text-center"
              footerStyle="width: 15%"
            />
            <Column
              :footer="totalRowData['not-naturalized']"
              footerClass="text-center"
              footerStyle="width: 15%"
            />
            <Column
              :footer="totalRowData.total"
              footerClass="text-center"
              footerStyle="width: 15%"
            />
            <Column
              :footer="totalRowData.percentageString"
              footerClass="text-center"
              footerStyle="width: 15%"
            />
          </Row>
        </ColumnGroup>
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
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import { DatePicker } from "primevue";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";

// --- 類型定義 ---
interface ApiDataRow {
  id: number;
  name: string;
  naturalized: number;
  "not-naturalized": number;
  total: number;
  percentage: number;
  percentageString: string;
}
interface Staff {
  name: string;
  fullName: string;
}
interface GenderOption {
  name: string;
  code: number | null;
}

// --- 響應式狀態 ---
const tableData = ref<ApiDataRow[]>([]);
const totalRowData = ref<any | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// 篩選器狀態
const dateRange = ref<Date[] | null>(null);
const staffList = ref<Staff[]>([]);
const selectedStaffIds = ref<string[] | null>(null);
const selectedGender = ref<number | null>(null); // null 代表全部
const genderOptions = ref<GenderOption[]>([
  { name: "全部", code: null },
  { name: "男", code: 0 },
  { name: "女", code: 1 },
]);

// 按鈕禁用狀態
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

  if (selectedGender.value !== null) {
    params.gender = selectedGender.value;
  }

  try {
    const response = await apiHandler.get(
      "/report/general/nationalityToIdentity",
      { params },
    );
    const responseData = response.data;

    if (responseData && responseData.success) {
      const originalData: ApiDataRow[] = responseData.data || [];
      tableData.value = originalData;

      // 如果有資料，才計算合計行
      if (originalData.length > 0) {
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

        totalRowData.value = {
          name: "合計",
          naturalized: totalNaturalized,
          "not-naturalized": totalNotNaturalized,
          total: grandTotal,
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

// --- 生命週期鉤子 ---
onMounted(() => {
  // 頁面載入時，只獲取工作人員列表以供選擇
  fetchStaffList();
});
</script>

<style scoped>
/* ★★★ 修改點: 簡化為單一表格的 Footer 樣式 ★★★ */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-200) !important;
}

/* 確保表頭文字置中 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
</style>
