<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">新入境服務方式統計表</h3>

    <!-- ★★★ 新增: 篩選器區域 ★★★ -->
    <div class="flex align-items-center gap-3 mb-3">
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
        showGridlines
        class="p-datatable-sm"
        responsiveLayout="scroll"
        rowGroupMode="rowspan"
        groupRowsBy="mainCategory"
      >
        <Column
          header="服務方式"
          field="mainCategory"
          class="font-bold fixed-col"
        ></Column>
        <Column header="性別" field="gender" class="fixed-col"></Column>
        <Column
          v-for="method in headerServiceMethods"
          :key="method.id"
          :header="method.name"
          :field="`method_${method.id}`"
          bodyClass="text-center"
        ></Column>

        <ColumnGroup type="footer">
          <Row v-for="(row, index) in footerData" :key="`footer-row-${index}`">
            <Column
              :footer="row.label"
              :colspan="2"
              footerClass="text-center font-bold"
            />
            <Column
              v-for="method in headerServiceMethods"
              :key="`footer-col-${method.id}`"
              :footer="row[`method_${method.id}`].toString()"
              footerClass="text-center font-bold"
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
import { DatePicker } from "primevue";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
interface ApiServiceMethodData {
  id: number;
  name: string;
  maleTargetNum: number;
  maleServiceNum: number;
  femaleTargetNum: number;
  femaleServiceNum: number;
  percentageString: string;
}
interface TableRow {
  mainCategory: string;
  gender: string;
  [key: string]: string | number;
}
interface FooterRow {
  label: string;
  [key: string]: string | number;
}
interface HeaderServiceMethod {
  id: number;
  name: string;
}
interface Staff {
  name: string;
  fullName: string;
} // 新增 Staff 類型

// --- 響應式狀態 ---
const tableData = ref<TableRow[]>([]);
const headerServiceMethods = ref<HeaderServiceMethod[]>([]);
const footerData = ref<FooterRow[]>([]);
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
  if (isQueryDisabled.value) return;
  isLoading.value = true;
  error.value = null;
  // 重置所有相關狀態
  tableData.value = [];
  headerServiceMethods.value = [];
  footerData.value = [];

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
    const response = await apiHandler.get("/report/arrival/serviceMethod", {
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
      const originalData: ApiServiceMethodData[] = responseData.data;

      headerServiceMethods.value = originalData.map((item) => ({
        id: item.id,
        name: item.name,
      }));

      const dataMap = new Map<number, ApiServiceMethodData>(
        originalData.map((item) => [item.id, item]),
      );

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

      tableData.value = metrics.map((metric) => {
        const row: TableRow = {
          mainCategory: metric.mainCategory,
          gender: metric.gender,
        };
        headerServiceMethods.value.forEach((method) => {
          const apiItem = dataMap.get(method.id);
          const value = apiItem ? apiItem[metric.apiKey] : 0;
          row[`method_${method.id}`] = value;
        });
        return row;
      });

      const percentageRow: FooterRow = { label: "總人次百分比" };
      const caseCountRow: FooterRow = { label: "案數" };
      headerServiceMethods.value.forEach((method, index) => {
        const apiItem = dataMap.get(method.id);
        percentageRow[`method_${method.id}`] = String(
          apiItem ? apiItem.percentageString : "0 %",
        );
        if (index === 0) {
          caseCountRow[`method_${method.id}`] = response.data.meta?.total ?? 0; // 使用 ?. 安全訪問
        } else {
          caseCountRow[`method_${method.id}`] = "";
        }
      });

      footerData.value = [percentageRow, caseCountRow];
    } else if (responseData && !responseData.success) {
      error.value = responseData.message || "未能獲取統計資料。";
    }
    // 如果 data 是空陣列，則保持表格為空，顯示 #empty 模板
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "獲取資料時發生未知錯誤。";
    console.error("Error fetching report data:", err);
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
  background-color: var(--surface-100) !important;
}
.fixed-col {
  background-color: var(--surface-50) !important;
}
</style>
