<template>
  <div>
    <!-- 新增：篩選控制區域 -->
    <div class="filter-controls p-3 surface-ground border-round mb-3">
      <!-- 篩選按鈕：點擊後觸發 toggleFilterRow 方法 -->
      <Button
        :label="isFilterRowVisible ? '隱藏篩選' : '顯示篩選'"
        :icon="isFilterRowVisible ? 'pi pi-filter-slash' : 'pi pi-filter'"
        class="p-button-secondary p-button-sm"
        @click="toggleFilterRow"
      />
      <!-- 動態顯示的篩選器行，並加入過渡動畫 -->
      <transition name="p-toggleable-content">
        <div
          v-show="isFilterRowVisible"
          class="grid formgrid mt-3 align-items-end"
        >
          <!-- 案號篩選 -->
          <div class="field col-12 md:col-6 lg:col-3">
            <label for="filterCaseNumber">案號</label>
            <InputText
              id="filterCaseNumber"
              v-model="filters['caseNumber'].value"
              placeholder="按案號搜尋"
              class="p-inputtext-sm w-full"
            />
          </div>

          <!-- 工作人員篩選 (根據權限顯示) -->
          <div
            v-if="shouldShowWorkerColumn"
            class="field col-12 md:col-6 lg:col-3"
          >
            <label for="filterWorker">工作人員</label>
            <InputText
              id="filterWorker"
              v-model="filters['worker'].value"
              placeholder="按工作人員搜尋"
              class="p-inputtext-sm w-full"
            />
          </div>
          <!-- ⭐ 3. 新增：日期區間篩選 -->
          <div class="field col-12 md:col-6 lg:col-3">
            <label for="filterDateRange">日期區間</label>
            <Calendar
              id="filterDateRange"
              v-model="filters.dateRange.value"
              selectionMode="range"
              :manualInput="false"
              dateFormat="yy/mm/dd"
              placeholder="選擇日期範圍"
              showIcon
              class="p-inputtext-sm w-full"
            />
          </div>
          <!-- 狀態篩選 -->
          <div class="field col-12 md:col-6 lg:col-3">
            <label for="filterStatus">狀態</label>
            <MultiSelect
              id="filterStatus"
              v-model="filters.status.value"
              :options="statusFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="可選多個狀態"
              display="chip"
              class="p-inputtext-sm w-full"
            />
          </div>

          <!-- 類別篩選 -->
          <div class="field col-12 md:col-6 lg:col-3">
            <label for="filterType">類別</label>
            <MultiSelect
              id="filterType"
              v-model="filters.type.value"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="可選多個類別"
              display="chip"
              class="p-inputtext-sm w-full"
            />
          </div>
          <!-- ⭐⭐ 新增：操作按鈕區域 ⭐⭐ -->
          <div
            class="field col-12 lg:col-12 flex justify-content-end gap-2 mt-3"
          >
            <Button
              label="清除"
              icon="pi pi-eraser"
              class="p-button-outlined p-button-secondary"
              @click="handleClearFilters"
            />
            <Button label="查詢" icon="pi pi-search" @click="handleSearch" />
          </div>
        </div>
      </transition>
    </div>
    <!-- 篩選區域結束 -->
    <div>
      <!-- ⭐⭐ 修改：啟用 Lazy Loading 和相關屬性 ⭐⭐ -->
      <DataTable
        :value="form_data"
        :lazy="true"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="onPage"
        @sort="onSort"
        scrollable
        scrollHeight="flex"
        dataKey="caseNumber"
        responsiveLayout="scroll"
        class="p-datatable-sm p-datatable-striped"
      >
        <template #header> </template>

        <Column
          field="caseNumber"
          header="案號"
          :sortable="true"
          style="min-width: 80px"
        >
          <template #body="slotProps">
            <span
              @click="handlecaseNumberClick(slotProps.data)"
              style="
                cursor: pointer;
                color: var(--p-primary-color); /* 使用 PrimeVue 主題色 */
                text-decoration: underline;
                font-weight: bold;
              "
              :title="`查看 caseNumber ${slotProps.data.caseNumber} 的詳細資料`"
            >
              {{ slotProps.data.caseNumber }}
            </span>
          </template>
        </Column>

        <Column
          v-if="shouldShowWorkerColumn"
          field="worker"
          header="工作人員"
          :sortable="true"
        >
          <template #body="slotProps">
            <i class="pi pi-user mr-1" style="vertical-align: middle"></i>
            <span style="vertical-align: middle">{{
              slotProps.data.worker
            }}</span>
          </template>
        </Column>

        <Column
          field="status"
          header="狀態"
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <Chip
              :label="getStatusText(slotProps.data.status)"
              :severity="getStatusSeverity(slotProps.data.status)"
              size="small"
            />
          </template>
        </Column>

        <Column
          field="type"
          header="類別"
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <Chip
              :label="getTypeText(slotProps.data.type)"
              :severity="getTypeSeverity(slotProps.data.type)"
              size="small"
            />
          </template>
        </Column>

        <Column field="filingDate" header="日期" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.date) }}
          </template>
        </Column>

        <Column header="操作" style="min-width: 200px">
          <template #body="slotProps">
            <div class="flex gap-2 justify-content-center">
              <Button
                label="開案"
                class="p-button-sm p-button-success"
                @click="handleOpenCase(slotProps.data)"
                :disabled="slotProps.data.status !== 0"
                :aria-label="
                  '為 caseNumber ' + slotProps.data.caseNumber + ' 開案'
                "
              />
              <Button
                label="不開案"
                class="p-button-sm p-button-warning"
                @click="handleDoNotOpenCase(slotProps.data)"
                :disabled="slotProps.data.status !== 0"
                :aria-label="
                  '將案號 ' + slotProps.data.caseNumber + ' 設為不開案'
                "
              />
              <Button
                label="結案"
                class="p-button-sm p-button-warning"
                @click="handleFinishCase(slotProps.data)"
                :disabled="slotProps.data.status !== 1"
                :aria-label="
                  '將案號 ' + slotProps.data.caseNumber + ' 設為結案'
                "
              />
            </div>
          </template>
        </Column>

        <template #empty> 沒有可顯示的資料。 </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
// class import
import { useSessionStore } from "../stores/auth"; // 確認路徑正確
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";
// --- PrimeVue 元件導入 ---
import { ref, onMounted, computed } from "vue";
import type {
  DataTablePageEvent,
  DataTableSortEvent,
} from "primevue/datatable";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import Button from "primevue/button";
//import FilterMatchMode from "primevue/datatable";
import InputText from "primevue/inputtext"; // <-- **新增導入**
//import { Transition } from "vue"; // <-- **新增導入 (可選)**
import Calendar from "primevue/calendar"; // ⭐ 1. 導入 Calendar 元件
import MultiSelect from "primevue/multiselect"; // ⭐ 1. 新增導入 MultiSelect 元件
//import { list } from "@primeuix/themes/aura/autocomplete";

// 移除了 Button, ProgressSpinner, Message, Card, Divider

// --- 狀態變數 ---
const form_data = ref([]);
const userStore = useSessionStore();
const router = useRouter();
const loading = ref(false); // 新增：控制載入動畫
const totalRecords = ref(0); // 新增：存放總記錄數
// ⭐⭐ 修改：lazyParams 用來儲存分頁和排序的狀態 ⭐⭐
const lazyParams = ref({
  first: 0,
  rows: 10, // 每頁筆數
  page: 0, // 目前頁碼 (0-indexed)
  sortField: "fillingdate", // 預設排序欄位
  sortOrder: -1, // 預設排序方向 (1=asc, -1=desc)
});
// --- 新增：篩選功能相關狀態 ---
const isFilterRowVisible = ref(false); // 控制篩選區塊是否可見，預設隱藏
// 切換篩選區塊的顯示/隱藏
const toggleFilterRow = () => {
  isFilterRowVisible.value = !isFilterRowVisible.value;
};
// ⭐⭐ 修改：移除 FilterMatchMode，後端不需要這個資訊 ⭐⭐
const filters = ref({
  caseNumber: { value: null },
  worker: { value: null },
  status: { value: [] as number[] },
  type: { value: [] as number[] },
  dateRange: { value: null as Date[] | null },
});
//新增結束
// --- 對應關係與格式化  ---
const statusMap: { [key: number]: string } = {
  0: "未開案",
  1: "已開案",
  2: "不開案",
  3: "已結案",
};
const typeMap: { [key: number]: string } = { 1: "一般", 2: "新入境" };
const shouldShowWorkerColumn = computed(() => {
  const permission = userStore?.getPermission;
  return typeof permission === "number" && permission >= 10;
});
// --- 新增：為 Dropdown 準備選項陣列 ---
const statusFilterOptions = computed(() =>
  Object.entries(statusMap).map(([value, label]) => ({
    label,
    value: parseInt(value),
  })),
);
const typeFilterOptions = computed(() =>
  Object.entries(typeMap).map(([value, label]) => ({
    label,
    value: parseInt(value),
  })),
);

const getStatusText = (status: number): string => statusMap[status] || "未知";
const getTypeText = (type: number): string => typeMap[type] || "未知";

type ChipSeverity =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "secondary"
  | "contrast"
  | "primary"
  | null;

const getStatusSeverity = (status: number): ChipSeverity => {
  switch (status) {
    case 0:
      return "secondary";
    case 1:
      return "success";
    case 2:
      return "warning";
    case 3:
      return "contrast";
    default:
      return null;
  }
};
const getTypeSeverity = (type: number): ChipSeverity => {
  switch (type) {
    case 1:
      return "info";
    case 2:
      return "primary";
    default:
      return null;
  }
};
//格式化日期
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
  } catch (e) {
    console.error("日期格式化錯誤:", e);
    return dateString;
  }
};
//主責社工隱藏

// ⭐⭐ 新增/重構：核心資料載入函式 ⭐⭐
const loadLazyData = async () => {
  loading.value = true;
  // --- 日期處理 ---
  // 從 filters 中取出日期陣列 [dateStart, dateEnd]
  const dateRange = filters.value.dateRange.value;
  let dateStart = null;
  let dateEnd = null;

  // 檢查日期陣列是否存在且有效
  if (dateRange && Array.isArray(dateRange) && dateRange[0]) {
    // 將 Date 物件格式化為後端看得懂的 'YYYY-MM-DD' 字串
    // 這樣可以避免時區問題
    const formatDateForApi = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    dateStart = formatDateForApi(dateRange[0]);
    // 如果使用者只選了一個日期，第二個日期會是 null
    if (dateRange[1]) {
      dateEnd = formatDateForApi(dateRange[1]);
    }
  }
  // 1. 組合 API 參數
  const apiParams = {
    // 分頁參數
    page: lazyParams.value.page, // PrimeVue 的 page event 直接提供 0-indexed 頁碼
    maxItems: lazyParams.value.rows,

    // 排序參數
    sort:
      lazyParams.value.sortOrder === 1
        ? lazyParams.value.sortField
        : "-" + lazyParams.value.sortField,
    //sortBy: lazyParams.value.sortField,
    //sortOrder: lazyParams.value.sortOrder === 1 ? "asc" : "desc",

    // 篩選參數：只提取有值的篩選器
    caseNumber: filters.value.caseNumber.value,
    worker: filters.value.worker.value,
    status: filters.value.status.value,
    type: filters.value.type.value,
    dateStart: dateStart, // 加入開始日期參數
    dateEnd: dateEnd, // 加入結束日期參數
  };

  // 過濾掉值為 null 或空字串的參數，避免送到後端
  const cleanParams = Object.fromEntries(
    Object.entries(apiParams).filter(
      ([_, v]) => v !== null && v !== undefined && v !== "",
    ),
  );
  //test api report
  try {
    await apiHandler.get("/report/AgeToNationality");
  } catch (error) {
  } finally {
  }

  // 2. 呼叫 API
  try {
    const response = await apiHandler.get("/form/assign", {
      params: cleanParams,
    });

    form_data.value = response.data.data; // 填充表格資料
    totalRecords.value = response.data.meta.total; // 更新總筆數
  } catch (error) {
    console.error("載入資料失敗:", error);
    // 可以在此處加入錯誤提示，例如使用 PrimeVue Toast
  } finally {
    loading.value = false;
  }
};
// --- 事件處理函式 ---

// ⭐⭐ 新增：處理分頁變更的事件 ⭐⭐
const onPage = (event: DataTablePageEvent) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  loadLazyData();
};

// ⭐⭐ 新增：處理排序變更的事件 ⭐⭐
const onSort = (event: DataTableSortEvent) => {
  lazyParams.value.sortField = event.sortField as string;
  lazyParams.value.sortOrder = event.sortOrder as 1 | -1;
  loadLazyData();
};

// ⭐⭐ 新增：處理查詢按鈕點擊 ⭐⭐
const handleSearch = () => {
  // 查詢時，永遠從第一頁開始
  lazyParams.value.page = 0;
  lazyParams.value.first = 0;
  loadLazyData();
};
// ⭐⭐ 新增：處理清除篩選按鈕點擊 ⭐⭐
const handleClearFilters = () => {
  filters.value = {
    caseNumber: { value: null },
    worker: { value: null },
    status: { value: [] },
    type: { value: [] },
    dateRange: { value: null }, // 確保清除時也重置日期
  };
  // 清除後也重新查詢
  handleSearch();
};
// --- 修改後的 handleIdClick 方法 (只負責路由跳轉) ---
const handlecaseNumberClick = (item: { caseNumber: string; type: number }) => {
  let typeName = "unknown";
  if (item.type === 1) {
    typeName = "general";
  } else if (item.type === 2) {
    typeName = "arrival";
  }

  if (typeName === "unknown") {
    console.error("handlecaseNumberClick: 未知的記錄類型:", item.type);
    return;
  }

  // 假設你的詳細頁面路由是 /assigns/:type/:caseNumber
  const targetPath = `/assigns/${typeName}/${item.caseNumber}`;
  router.push(targetPath);
};
// 輔助函式：將案件類型數字轉換為路由可用的字串
const getTypeNameString = (type: number): string => {
  return type === 1 ? "general" : "arrival";
};

// 統一的導航函式
const navigateToOperationPage = (
  item: { caseNumber: string; type: number },
  operation: "open" | "refuse" | "close",
) => {
  const typeName = getTypeNameString(item.type);

  router.push({
    // 使用單一的路由名稱
    name: "AssignOperation", // <-- 請確保這個路由名稱與 router/index.ts 中定義的一致
    params: {
      type: typeName,
      id: item.caseNumber,
      operation: operation, // <-- 動態傳入操作類型
    },
  });
};

// ---未開案>>開案---
const handleOpenCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 0) return;
  navigateToOperationPage(item, "open");
};

// ---未開案>>不開案---
const handleDoNotOpenCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 0) return;
  navigateToOperationPage(item, "refuse");
};

// ---已開案>>結案---
const handleFinishCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 1) return;
  navigateToOperationPage(item, "close");
};

// --- 生命週期鉤子 ---
// ⭐⭐ 修改：onMounted 改為呼叫新的 loadLazyData 函式 ⭐⭐
onMounted(() => {
  loadLazyData();
});
</script>

<style scoped>
/* 你原有的其他列表樣式 */
.text-grey {
  color: var(--p-text-color-secondary);
}
.font-medium {
  font-weight: 500;
}
.text-color-secondary {
  color: var(--p-text-color-secondary);
}
.ml-auto {
  margin-left: auto;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-3 {
  margin-top: 0.75rem;
}
.mt-4 {
  margin-top: 1rem;
}
.pa-5 {
  padding: 1.25rem;
}
.text-center {
  text-align: center;
}
</style>
