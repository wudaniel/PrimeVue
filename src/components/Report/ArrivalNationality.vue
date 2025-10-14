<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">新入境訪視國籍統計表</h3>

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

    <!-- 狀態處理 (無變動) -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
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
          header="國籍"
          field="mainCategory"
          class="font-bold fixed-col"
        ></Column>
        <Column header="性別" field="gender" class="fixed-col"></Column>
        <Column
          v-for="nat in headerNationalities"
          :key="nat.id"
          :header="nat.name"
          :field="`nat_${nat.id}`"
          bodyClass="text-center"
        >
        </Column>

        <template #empty>
          <!-- ★★★ 修改點: 更新空狀態提示 ★★★ -->
          <div class="text-center p-4">請選擇篩選條件後點擊查詢。</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
// ★★★ 修改點: 引入 computed ★★★
import { ref, onMounted, computed } from "vue";
import { apiHandler } from "../../class/apiHandler";

// ★★★ 新增: 引入篩選器元件 ★★★
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 (新增 Staff) ---
interface ApiNationalityData {
  nationalityID: number;
  nationalityName: string;
  maleTargetNum: number;
  maleServiceNum: number;
  femaleTargetNum: number;
  femaleServiceNum: number;
  targetNum: number;
  serviceNum: number;
}
interface TableRow {
  mainCategory: string;
  gender: string;
  total: number;
  [key: string]: string | number;
}
interface HeaderNationality {
  id: number;
  name: string;
}
// ★★★ 新增: Staff 類型 ★★★
interface Staff {
  name: string;
  fullname: string;
}

// --- 響應式狀態 (新增篩選器相關狀態) ---
const tableData = ref<TableRow[]>([]);
const headerNationalities = ref<HeaderNationality[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// ★★★ 新增: 篩選器狀態 ★★★
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

// --- API 呼叫與資料處理 ---

// ★★★ 新增: 日期格式化與獲取工作人員列表的函式 ★★★
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

// ★★★ 修改點: 更新 fetchData 來處理篩選參數 ★★★
const fetchData = async () => {
  if (isQueryDisabled.value) return; // 防止在禁用時觸發

  isLoading.value = true;
  error.value = null;
  tableData.value = []; // 查詢前清空舊資料
  headerNationalities.value = []; // 查詢前清空舊表頭

  // 組合查詢參數
  const params: { [key: string]: any } = {};
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.dateStart = formatDate(dateRange.value[0]);
    params.dateEnd = formatDate(dateRange.value[1]);
  }
  if (selectedStaffIds.value && selectedStaffIds.value.length > 0) {
    params["workers[]"] = selectedStaffIds.value;
  }

  try {
    // 將參數帶入 API 請求
    const response = await apiHandler.get("/report/arrival/nationality", {
      params,
    });
    const responseData = response.data;

    // 後續資料處理邏輯完全不變
    if (responseData && responseData.success && responseData.data.length > 0) {
      const originalData: ApiNationalityData[] = responseData.data;
      headerNationalities.value = originalData
        .map((nat) => ({
          id: nat.nationalityID,
          name: nat.nationalityName,
        }))
        .sort((a, b) => a.id - b.id);
      const dataMap = new Map(
        originalData.map((item) => [item.nationalityID, item]),
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
      const processedData = metrics.map((metric) => {
        const row: TableRow = {
          mainCategory: metric.mainCategory,
          gender: metric.gender,
          total: 0,
        };
        let rowTotal = 0;
        headerNationalities.value.forEach((nat) => {
          const natData = dataMap.get(nat.id);
          const value = natData ? natData[metric.apiKey] : 0;
          row[`nat_${nat.id}`] = value;
          rowTotal += value;
        });
        row.total = rowTotal;
        return row;
      });
      tableData.value = processedData;
    } else {
      tableData.value = [];
      // 如果 API 成功但 data 為空，不顯示錯誤，讓 #empty 模板顯示
      if (!responseData.success) {
        error.value = responseData.message || "未能獲取統計資料或查無資料。";
      }
    }
  } catch (err: any) {
    console.error("Error fetching report data:", err);
    error.value = err.message || "獲取資料時發生未知錯誤。";
  } finally {
    isLoading.value = false;
  }
};

// ★★★ 修改點: onMounted 只獲取篩選器選項 ★★★
onMounted(() => {
  fetchStaffList();
  // 不再預設載入報表資料
  // fetchData();
});
</script>

<style scoped>
/* 樣式可以保持不變或沿用第一個組件的樣式 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}
.fixed-col {
  background-color: var(--surface-50);
}
</style>
