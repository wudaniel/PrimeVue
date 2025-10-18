<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">服務來源與需求分析表</h3>

    <!-- 篩選器區域 -->
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

    <!-- 主要內容區 -->
    <div v-else>
      <DataTable
        :value="flatTableData"
        showGridlines
        class="p-datatable-sm"
        :rowClass="() => 'data-row'"
      >
        <Column header="來源類型" style="width: 15%">
          <template #body="{ data }">
            <!-- 只有當 rowspan > 0 (即群組首行) 時才顯示內容 -->
            <span v-if="data.catRowspan > 0">{{ data.catName }}</span>
          </template>
        </Column>
        <Column header="轉介單位" style="width: 15%">
          <template #body="{ data }">
            <span v-if="data.sourceRowspan > 0">{{ data.sourceName }}</span>
          </template>
        </Column>
        <Column header="需求類別" style="width: 20%">
          <template #body="{ data }">
            <span v-if="data.needRowspan > 0">{{ data.needName }}</span>
          </template>
        </Column>
        <Column header="案次" bodyClass="text-center" style="width: 10%">
          <template #body="{ data }">
            <span v-if="data.needRowspan > 0">{{ data.needTotal }}</span>
          </template>
        </Column>
        <Column header="案號" bodyClass="text-center" style="width: 20%">
          <template #body="{ data }">
            <div class="case-cell-content">{{ data.caseNumbers }}</div>
          </template>
        </Column>
        <Column header="期程" bodyClass="text-center" style="width: 20%">
          <template #body="{ data }">
            <div class="case-cell-content">{{ data.caseDurations }}</div>
          </template>
        </Column>
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
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import { DatePicker } from "primevue";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
interface Case {
  assignCaseNumbers: string;
  caseDuration: number;
}
interface Need {
  needID: number;
  needName: string;
  total: number;
  cases: Case[];
}
interface Source {
  sourceID: number;
  sourceName: string;
  needs: Need[];
}
interface SourceCategory {
  sourceCatID: number;
  SourceCatName: string;
  sources: Source[];
}
interface Staff {
  name: string;
  fullName: string;
}

// 扁平化後的資料列結構
interface FlatRow {
  uniqueId: number;
  catName: string;
  catRowspan: number;
  sourceName: string;
  sourceRowspan: number;
  needName: string;
  needTotal: number;
  needRowspan: number;
  caseNumbers: string;
  caseDurations: string;
  // ★ 新增 class 標記
  isCatStart: boolean;
  isSourceStart: boolean;
  isNeedStart: boolean;
}

// --- 響應式狀態 ---
const flatTableData = ref<FlatRow[]>([]);
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

// --- 核心資料轉換函式 ---
const flattenApiData = (data: SourceCategory[]): FlatRow[] => {
  const result: FlatRow[] = [];
  let uniqueId = 0;

  data.forEach((cat) => {
    let isFirstRowInCat = true;
    const catTotalRows = cat.sources.reduce(
      (catSum, source) =>
        catSum +
        source.needs.reduce(
          (sourceSum, need) => sourceSum + Math.max(1, need.cases.length),
          0,
        ),
      0,
    );

    cat.sources.forEach((source) => {
      let isFirstRowInSource = true;
      const sourceTotalRows = source.needs.reduce(
        (sourceSum, need) => sourceSum + Math.max(1, need.cases.length),
        0,
      );

      source.needs.forEach((need) => {
        let isFirstRowInNeed = true;
        const needTotalRows = Math.max(1, need.cases.length);

        if (need.cases.length === 0) {
          result.push({
            uniqueId: uniqueId++,
            catName: cat.SourceCatName,
            catRowspan: isFirstRowInCat ? catTotalRows : 0,
            sourceName: source.sourceName,
            sourceRowspan: isFirstRowInSource ? sourceTotalRows : 0,
            needName: need.needName,
            needTotal: need.total,
            needRowspan: 1,
            caseNumbers: "",
            caseDurations: "",
            isCatStart: isFirstRowInCat,
            isSourceStart: isFirstRowInSource,
            isNeedStart: true,
          });
          isFirstRowInCat = false;
          isFirstRowInSource = false;
        } else {
          need.cases.forEach((caseItem) => {
            result.push({
              uniqueId: uniqueId++,
              catName: cat.SourceCatName,
              catRowspan: isFirstRowInCat ? catTotalRows : 0,
              sourceName: source.sourceName,
              sourceRowspan: isFirstRowInSource ? sourceTotalRows : 0,
              needName: need.needName,
              needTotal: need.total,
              needRowspan: isFirstRowInNeed ? needTotalRows : 0,
              caseNumbers: caseItem.assignCaseNumbers,
              caseDurations: String(caseItem.caseDuration),
              isCatStart: isFirstRowInCat,
              isSourceStart: isFirstRowInSource,
              isNeedStart: isFirstRowInNeed,
            });
            isFirstRowInCat = false;
            isFirstRowInSource = false;
            isFirstRowInNeed = false;
          });
        }
      });
    });
  });
  return result;
};

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

const fetchData = async () => {
  if (isQueryDisabled.value) return;
  isLoading.value = true;
  error.value = null;
  flatTableData.value = [];

  const params: { [key: string]: any } = {};
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.dateStart = formatDate(dateRange.value[0]);
    params.dateEnd = formatDate(dateRange.value[1]);
  }
  if (selectedStaffIds.value && selectedStaffIds.value.length > 0) {
    params["workers[]"] = selectedStaffIds.value;
  }

  try {
    const response = await apiHandler.get("/report/general/serviceSource", {
      params,
    });
    const responseData = response.data;

    if (responseData && responseData.success && responseData.data) {
      flatTableData.value = flattenApiData(responseData.data);
    } else {
      throw new Error(responseData.message || "API 回應格式不正確或請求失敗");
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "無法載入統計資料。";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStaffList();
});
</script>

<style scoped>
/* ★★★ 核心：使用 CSS 偽類和相鄰兄弟選擇器來模擬 rowspan 的邊框 ★★★ */

/* 基礎設定：讓所有儲存格的內容頂部對齊 */
:deep(.p-datatable-tbody td) {
  vertical-align: top;
}

/* 
  核心規則：找到一個數據行，如果它的 *下一個* 兄弟行 *沒有* 顯示 "來源類型" 的內容
  (即它的第一個 td 的內容是空的)，那麼就隱藏當前行第一個 td 的下邊框。
  這會將當前 td 和下一個 td 的邊框合併。
*/
:deep(.data-row:has(+ .data-row td:nth-child(1):empty) td:nth-child(1)) {
  border-bottom-width: 0;
}
:deep(.data-row:has(+ .data-row td:nth-child(2):empty) td:nth-child(2)) {
  border-bottom-width: 0;
}
:deep(.data-row:has(+ .data-row td:nth-child(3):empty) td:nth-child(3)) {
  border-bottom-width: 0;
}
:deep(.data-row:has(+ .data-row td:nth-child(4):empty) td:nth-child(4)) {
  border-bottom-width: 0;
}

/* 讓多個案號/期程的儲存格內容可以換行 (保留) */
.case-cell-content {
  white-space: pre-wrap;
  text-align: center;
}
</style>
