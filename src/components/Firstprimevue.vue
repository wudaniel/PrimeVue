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
        <!-- ★★★ 修改點：將 align-items-end 改為 align-items-start，確保頂部對齊 ★★★ -->
        <div
          v-show="isFilterRowVisible"
          class="grid formgrid mt-3 align-items-start"
        >
          <!-- 案號篩選 -->
          <!-- ★★★ 修改點：將 lg:col-4 改為 lg:col-6 使佈局更平衡 ★★★ -->
          <div class="field col-12 md:col-6 lg:col-6">
            <label for="filterCaseNumber">案號</label>
            <InputText
              id="filterCaseNumber"
              v-model="filters.caseNumber.value"
              placeholder="按案號搜尋"
              class="p-inputtext-sm w-full"
            />
          </div>

          <!-- 工作人員篩選 -->
          <!-- ★★★ 修改點：將 lg:col-4 改為 lg:col-6 使佈局更平衡 ★★★ -->
          <div
            v-if="shouldShowWorkerColumn"
            class="field col-12 md:col-6 lg:col-6"
          >
            <label for="filterWorker">工作人員</label>
            <MultiSelect
              id="filterWorker"
              v-model="filters.worker.value"
              :options="workerList"
              optionLabel="fullName"
              optionValue="name"
              :maxSelectedLabels="2"
              selectedItemsLabel="已選擇 {0} 位"
              placeholder="可選多個工作人員"
              display="chip"
              class="p-inputtext-sm w-full"
              filter
            />
          </div>

          <!-- 日期區間篩選 -->
          <!-- ★★★ 修改點：將 lg:col-4 改為 lg:col-6 使佈局更平衡 ★★★ -->
          <div class="field col-12 md:col-6 lg:col-6">
            <label for="filterDateRange">日期區間</label>
            <DatePicker
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
          <!-- ★★★ 修改點：將 lg:col-4 改為 lg:col-6 使佈局更平衡 ★★★ -->
          <div class="field col-12 md:col-6 lg:col-6">
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
          <!-- ★★★ 修改點：將 lg:col-4 改為 lg:col-6 使佈局更平衡 ★★★ -->
          <div class="field col-12 md:col-6 lg:col-6">
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
          <!-- 操作按鈕區域 -->
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
              getWorkerFullName(slotProps.data.worker)
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
                v-if="shouldShowOpen"
                label="不開案"
                class="p-button-sm p-button-warning"
                @click="handleDoNotOpenCase(slotProps.data)"
                :disabled="slotProps.data.status !== 0"
                :aria-label="
                  '將案號 ' + slotProps.data.caseNumber + ' 設為不開案'
                "
              />
              <Button
                v-if="shouldShowOpen"
                label="結案"
                class="p-button-sm p-button-danger"
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
import { useSessionStore } from "../stores/auth";
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
import InputText from "primevue/inputtext";
import { DatePicker } from "primevue";
import MultiSelect from "primevue/multiselect";

interface Staff {
  name: string;
  fullName: string;
}

// --- 狀態變數 ---
const form_data = ref([]);
const userStore = useSessionStore();
const router = useRouter();
const loading = ref(false);
const totalRecords = ref(0);
const lazyParams = ref({
  first: 0,
  rows: 10,
  page: 0,
  sortField: "filingdate",
  sortOrder: -1,
});
// --- 篩選功能相關狀態 ---
const isFilterRowVisible = ref(false);
const toggleFilterRow = () => {
  isFilterRowVisible.value = !isFilterRowVisible.value;
};
const filters = ref({
  caseNumber: { value: null as string | null },
  worker: { value: [] as string[] },
  status: { value: [] as number[] },
  type: { value: [] as number[] },
  dateRange: { value: null as Date[] | null },
});
const workerList = ref<Staff[]>([]);

const workerNameMap = computed(() => {
  return new Map(
    workerList.value.map((worker) => [worker.name, worker.fullName]),
  );
});
const getWorkerFullName = (workerName: string): string => {
  return workerNameMap.value.get(workerName) || workerName;
};

// --- 對應關係與格式化 ---
const statusMap: { [key: number]: string } = {
  0: "未開案",
  1: "已開案",
  2: "不開案",
  3: "已結案",
};
const typeMap: { [key: number]: string } = { 1: "一般", 2: "新入境" };
const shouldShowWorkerColumn = computed(() => {
  const permission = userStore?.getPermission;
  return typeof permission === "number" && permission < 20;
});
const shouldShowOpen = computed(() => {
  const permission = userStore?.getPermission;
  return typeof permission === "number" && permission < 20;
});
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
    return dateString;
  }
};

const fetchWorkerList = async () => {
  try {
    const response = await apiHandler.get("/option/workers");
    if (response.data && response.data.success) {
      workerList.value = response.data.data;
    }
  } catch (error) {}
};

// --- 核心資料載入函式 ---
const loadLazyData = async () => {
  loading.value = true;
  const dateRange = filters.value.dateRange.value;
  let dateStart = null;
  let dateEnd = null;
  if (dateRange && Array.isArray(dateRange) && dateRange[0]) {
    const formatDateForApi = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    dateStart = formatDateForApi(dateRange[0]);
    if (dateRange[1]) {
      dateEnd = formatDateForApi(dateRange[1]);
    }
  }
  const apiParams = {
    page: lazyParams.value.page,
    maxItems: lazyParams.value.rows,
    sort:
      lazyParams.value.sortOrder === 1
        ? lazyParams.value.sortField
        : "-" + lazyParams.value.sortField,
    caseNumber: filters.value.caseNumber.value,
    "workers[]": filters.value.worker.value,
    status: filters.value.status.value,
    type: filters.value.type.value,
    dateStart: dateStart,
    dateEnd: dateEnd,
  };
  const cleanParams = Object.fromEntries(
    Object.entries(apiParams).filter(([_, v]) => {
      if (v === null || v === undefined || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }),
  );
  try {
    const response = await apiHandler.get("/form/assign", {
      params: cleanParams,
    });
    form_data.value = response.data.data;
    totalRecords.value = response.data.meta.total;
  } catch (error) {
  } finally {
    loading.value = false;
  }
};
// --- 事件處理函式 ---
const onPage = (event: DataTablePageEvent) => {
  lazyParams.value.page = event.page;
  lazyParams.value.rows = event.rows;
  loadLazyData();
};
const onSort = (event: DataTableSortEvent) => {
  lazyParams.value.sortField = event.sortField as string;
  lazyParams.value.sortOrder = event.sortOrder as 1 | -1;
  loadLazyData();
};
const handleSearch = () => {
  lazyParams.value.page = 0;
  lazyParams.value.first = 0;
  loadLazyData();
};
const handleClearFilters = () => {
  filters.value = {
    caseNumber: { value: null },
    worker: { value: [] },
    status: { value: [] },
    type: { value: [] },
    dateRange: { value: null },
  };
  handleSearch();
};
const handlecaseNumberClick = (item: { caseNumber: string; type: number }) => {
  let typeName = "unknown";
  if (item.type === 1) typeName = "general";
  else if (item.type === 2) typeName = "arrival";
  if (typeName === "unknown") return;
  const targetPath = `/assigns/${typeName}/${item.caseNumber}`;
  router.push(targetPath);
};
const getTypeNameString = (type: number): string =>
  type === 1 ? "general" : "arrival";
const navigateToOperationPage = (
  item: { caseNumber: string; type: number },
  operation: "open" | "refuse" | "close",
) => {
  const typeName = getTypeNameString(item.type);
  router.push({
    name: "AssignOperation",
    params: { type: typeName, id: item.caseNumber, operation: operation },
  });
};
const handleOpenCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 0) return;
  navigateToOperationPage(item, "open");
};
const handleDoNotOpenCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 0) return;
  navigateToOperationPage(item, "refuse");
};
const handleFinishCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  if (item.status !== 1) return;
  navigateToOperationPage(item, "close");
};

// --- 生命週期鉤子 ---
onMounted(() => {
  loadLazyData();
  fetchWorkerList();
});
</script>

<!-- ★★★ 新增的 CSS 區塊 ★★★ -->
<style scoped>
/*
  使用 :deep() 偽類來穿透 scoped CSS 的限制，
  以便我們能對 PrimeVue 子元件的內部樣式進行修改。
  這段 CSS 會選取 'field' class 下的所有 PrimeVue 輸入元件，
  並確保它們有相同的最小高度和垂直居中的內容。
*/
.field :deep(.p-inputtext),
.field :deep(.p-multiselect) {
  min-height: 42px; /* 設定一個統一的最小高度。您可以根據設計調整此數值 */
  display: flex;
  align-items: center;
}

/* 
  特別針對 MultiSelect 的 placeholder 文字，確保它在容器內垂直居中。
  這是因為 MultiSelect 的內部結構與 InputText 不同。
*/
.field :deep(.p-multiselect .p-multiselect-label) {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
