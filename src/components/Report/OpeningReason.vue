<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">開案個案需求表</h3>

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
          optionLabel="name"
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
        showGridlines
        class="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <ColumnGroup type="header">
          <Row>
            <Column header="國籍別" :rowspan="2" class="font-bold fixed-col" />
            <Column
              v-for="nat in headerNationality"
              :key="nat.id"
              :header="nat.name"
              :colspan="2"
              class="ellipsis-header"
            ></Column>
            <Column header="小計" :rowspan="2" class="font-bold fixed-col" />
          </Row>
          <Row>
            <template v-for="nat in headerNationality" :key="nat.id + '-sub'">
              <Column header="未歸化" />
              <Column header="已歸化" />
            </template>
          </Row>
        </ColumnGroup>

        <Column field="reasonName" class="font-bold fixed-col"></Column>
        <template v-for="nat in headerNationality" :key="nat.id + '-data'">
          <Column
            :field="`nat_${nat.id}_not_naturalized`"
            bodyClass="text-center"
            :sortable="true"
          />
          <Column
            :field="`nat_${nat.id}_naturalized`"
            bodyClass="text-center"
            :sortable="true"
          />
        </template>
        <Column
          field="total"
          bodyClass="text-center"
          class="font-bold fixed-col"
          :sortable="true"
        />

        <ColumnGroup type="footer">
          <Row>
            <Column footer="合計" class="fixed-col" />
            <template
              v-for="nat in headerNationality"
              :key="nat.id + '-footer'"
            >
              <Column
                :footer="getFooterValue(`nat_${nat.id}_not_naturalized`)"
                class="text-center"
              />
              <Column
                :footer="getFooterValue(`nat_${nat.id}_naturalized`)"
                class="text-center"
              />
            </template>
            <Column
              :footer="getFooterValue('total')"
              class="text-center fixed-col"
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
// ★★★ 新增: 引入篩選器元件 ★★★
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
interface NationalityData {
  nationalityID: number;
  name: string;
  naturalized: number;
  "not-naturalized": number;
}
interface ApiReasonData {
  id: number;
  name: string;
  nationality: NationalityData[];
  total: number;
}
interface TableRow {
  reasonId: number;
  reasonName: string;
  total: number;
  [key: string]: string | number;
}
interface HeaderNationality {
  id: number;
  name: string;
}
interface Staff {
  name: string;
} // 新增 Staff 類型

// --- 響應式狀態 ---
const tableData = ref<TableRow[]>([]);
const footerData = ref<TableRow | null>(null);
const headerNationality = ref<HeaderNationality[]>([]);
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

// --- 輔助函式 ---
const getFooterValue = (field: string): string => {
  if (!footerData.value) return "";
  const value = footerData.value[field];
  return value !== null && value !== undefined ? String(value) : "";
};
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

// ★★★ 修改: fetchData 函式以包含篩選參數 ★★★
const fetchData = async () => {
  if (isQueryDisabled.value) return;
  isLoading.value = true;
  error.value = null;
  // 重置所有相關狀態
  tableData.value = [];
  headerNationality.value = [];
  footerData.value = null;

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
    const response = await apiHandler.get("/report/general/openingReason", {
      params,
    });
    const responseData = response.data;

    // ★★★ 核心處理邏輯不變，只在成功響應後執行 ★★★
    if (
      responseData &&
      responseData.success &&
      responseData.data &&
      responseData.data.length > 0
    ) {
      const originalData: ApiReasonData[] = responseData.data;

      // 1. 提取表頭
      headerNationality.value = originalData[0].nationality.map((nat) => ({
        id: nat.nationalityID,
        name: nat.name,
      }));

      // 2. 扁平化資料
      const processedData = originalData.map((reason) => {
        const row: TableRow = {
          reasonId: reason.id,
          reasonName: reason.name,
          total: reason.total,
        };
        reason.nationality.forEach((nat) => {
          row[`nat_${nat.nationalityID}_naturalized`] = nat.naturalized;
          row[`nat_${nat.nationalityID}_not_naturalized`] =
            nat["not-naturalized"];
        });
        return row;
      });
      tableData.value = processedData;

      // 3. 計算合計
      const totals: TableRow = { reasonId: -1, reasonName: "合計", total: 0 };
      headerNationality.value.forEach((nat) => {
        totals[`nat_${nat.id}_naturalized`] = 0;
        totals[`nat_${nat.id}_not_naturalized`] = 0;
      });
      processedData.forEach((row) => {
        totals.total += row.total as number;
        headerNationality.value.forEach((nat) => {
          (totals[`nat_${nat.id}_naturalized`] as number) += row[
            `nat_${nat.id}_naturalized`
          ] as number;
          (totals[`nat_${nat.id}_not_naturalized`] as number) += row[
            `nat_${nat.id}_not_naturalized`
          ] as number;
        });
      });
      footerData.value = totals;
    } else if (responseData && !responseData.success) {
      throw new Error(responseData.message || "API 請求失敗");
    }
    // 如果 responseData.data 是空陣列或不存在，則保持表格為空，顯示 #empty 模板
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
:deep(.ellipsis-header .p-column-header-content) {
  display: block;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0.75rem 0.5rem;
}
</style>
