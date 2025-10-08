<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">服務項目統計表</h3>

    <!-- 篩選器區域 (無變動) -->
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
          header="統計項目"
          field="mainCategory"
          class="font-bold fixed-col"
        ></Column>
        <Column header="性別" field="gender" class="fixed-col"></Column>

        <!-- 動態生成所有服務項目的欄位 -->
        <Column
          v-for="item in headerServiceItems"
          :key="item.id"
          :header="item.name"
          :field="`item_${item.id}`"
          bodyClass="text-center"
        ></Column>

        <!-- Footer -->
        <ColumnGroup type="footer">
          <Row v-for="(row, index) in footerData" :key="`footer-row-${index}`">
            <Column
              :footer="row.label"
              :colspan="2"
              footerClass="text-center font-bold"
            />
            <Column
              v-for="item in headerServiceItems"
              :key="`footer-col-${item.id}`"
              :footer="row[`item_${item.id}`]"
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
import Calendar from "primevue/calendar";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";

// --- 類型定義 ---
interface ApiServiceItemData {
  id: number;
  name: string;
  maleTargetNum: number;
  maleServiceNum: number;
  femaleTargetNum: number;
  femaleServiceNum: number;
  percentage: number;
  percentageString: string;
}
interface TableRow {
  mainCategory: string;
  gender: string;
  total: number;
  [key: string]: string | number;
} // 新增 total
interface FooterRow {
  label: string;
  total: number | string;
  [key: string]: string | number;
} // 新增 total
interface HeaderServiceItem {
  id: number;
  name: string;
}
interface Staff {
  name: string;
}

// --- 響應式狀態 (無變動) ---
const tableData = ref<TableRow[]>([]);
const headerServiceItems = ref<HeaderServiceItem[]>([]);
const footerData = ref<FooterRow[]>([]);
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

// ★★★ 修改點: 更新 fetchData 來計算合計值 ★★★
const fetchData = async () => {
  if (isQueryDisabled.value) return;
  isLoading.value = true;
  error.value = null;
  tableData.value = [];
  headerServiceItems.value = [];
  footerData.value = [];

  const params: { [key: string]: any } = {};
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    params.dateStart = formatDate(dateRange.value[0]);
    params.dateEnd = formatDate(dateRange.value[1]);
  }
  if (selectedStaffIds.value && selectedStaffIds.value.length > 0) {
    params["workers[]"] = selectedStaffIds.value;
  }

  try {
    const response = await apiHandler.get("/report/general/serviceItem", {
      params,
    });
    const responseData = response.data;

    if (
      responseData &&
      responseData.success &&
      responseData.data &&
      responseData.data.length > 0
    ) {
      const originalData: ApiServiceItemData[] = responseData.data;

      headerServiceItems.value = originalData.map((item) => ({
        id: item.id,
        name: item.name || "未分類",
      }));

      const dataMap = new Map<number, ApiServiceItemData>(
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

      // 修改點 1: 在轉置資料時，計算每一行的總和
      tableData.value = metrics.map((metric) => {
        const row: Partial<TableRow> = {
          // 使用 Partial 方便累加
          mainCategory: metric.mainCategory,
          gender: metric.gender,
        };
        let rowTotal = 0;
        headerServiceItems.value.forEach((item) => {
          const apiItem = dataMap.get(item.id);
          const value = apiItem ? apiItem[metric.apiKey] : 0;
          row[`item_${item.id}`] = value;
          rowTotal += value;
        });
        row.total = rowTotal; // 將計算出的總和存入 row 物件
        return row as TableRow;
      });

      // 修改點 2: 在計算 Footer 時，也加入總和
      const grandTotalCases = originalData.reduce(
        (sum, item) => sum + item.maleTargetNum + item.femaleTargetNum,
        0,
      );

      const percentageRow: FooterRow = {
        label: "總人次百分比",
        total: "100.00 %",
      };
      const caseCountRow: FooterRow = { label: "案數", total: grandTotalCases };

      headerServiceItems.value.forEach((item, index) => {
        const apiItem = dataMap.get(item.id);
        percentageRow[`item_${item.id}`] = String(
          apiItem ? apiItem.percentageString || "N/A" : "0 %",
        );

        // 案數 Footer 邏輯：第一個欄位放總案數，其餘為空
        if (index === 0) {
          caseCountRow[`item_${item.id}`] = grandTotalCases;
        } else {
          caseCountRow[`item_${item.id}`] = "";
        }
      });
      footerData.value = [percentageRow, caseCountRow];
    } else if (responseData && !responseData.success) {
      error.value = responseData.message || "未能獲取統計資料。";
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "獲取資料時發生未知錯誤。";
  } finally {
    isLoading.value = false;
  }
};

// 輔助函式 (無變動)
const getFooterValue = (field: string): string => {
  if (!footerData.value || footerData.value.length === 0) return "";
  // 這是一個簡化，假設我們總是能從第一個 footer row 找到值
  // 在這個元件中，兩個 footer row 的結構是一致的
  const value =
    (footerData.value[0] as any)[field] ?? (footerData.value[1] as any)[field];
  if (field === "total") {
    return (
      String((footerData.value[0] as any).total ?? "") +
      " / " +
      String((footerData.value[1] as any).total ?? "")
    );
  }
  return value !== null && value !== undefined ? String(value) : "";
};

onMounted(() => {
  fetchStaffList();
});
</script>

<style scoped>
/* 樣式無變動 */
</style>
