<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">開案個案需求表</h3>

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
        :value="tableData"
        showGridlines
        class="p-datatable-sm"
        responsiveLayout="scroll"
      >
        <!-- ★ 複雜表頭定義 ★ -->
        <ColumnGroup type="header">
          <Row>
            <Column header="國籍別" :rowspan="2" class="font-bold fixed-col" />
            <!-- 動態生成所有國籍的大標題 -->
            <Column
              v-for="nat in headerNationality"
              :key="nat.id"
              :header="nat.name"
              :colspan="2"
              class="ellipsis-header"
            >
              <template #header>
                <span :title="nat.name">{{ nat.name }}</span>
              </template>
            </Column>
            <Column header="小計" :rowspan="2" class="font-bold fixed-col" />
          </Row>
          <Row>
            <!-- 動態生成 "未歸化" 和 "已歸化" 子標題 -->
            <template v-for="nat in headerNationality" :key="nat.id + '-sub'">
              <Column header="未歸化" />
              <Column header="已歸化" />
            </template>
          </Row>
        </ColumnGroup>

        <!-- ★ 主要資料欄位定義 ★ -->

        <!-- 固定欄位: 開案原因 -->
        <Column field="reasonName" class="font-bold fixed-col"></Column>

        <!-- 動態資料欄位 -->
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

        <!-- 固定欄位: 小計 -->
        <Column
          field="total"
          bodyClass="text-center"
          class="font-bold fixed-col"
          :sortable="true"
        />

        <!-- ★ 合計行 (Footer) ★ -->
        <ColumnGroup type="footer">
          <Row>
            <Column footer="合計" class="fixed-col" />
            <!-- 動態生成合計值 -->
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
          <div class="text-center p-4">沒有可顯示的統計資料。</div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

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
  [key: string]: string | number; // 允許動態屬性
}
interface HeaderNationality {
  id: number; // 使用 nationalityID 作為唯一標識
  name: string;
}

// --- 響應式狀態 ---
const tableData = ref<TableRow[]>([]);
const footerData = ref<TableRow | null>(null);
const headerNationality = ref<HeaderNationality[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// --- 輔助函式 ---
const getFooterValue = (field: string): string => {
  if (!footerData.value) return "";
  const value = footerData.value[field];
  if (value === null || value === undefined) return "";
  return String(value);
};

// --- 資料處理與獲取 ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/general/openingReason");
    const responseData = response.data;

    if (responseData && responseData.success && responseData.data.length > 0) {
      const originalData: ApiReasonData[] = responseData.data;

      // 步驟 1: 從第一筆資料中提取所有國籍列表，用於生成表頭
      // 這是最原始的邏輯，會顯示 API 回傳的所有國籍
      headerNationality.value = originalData[0].nationality.map((nat) => ({
        id: nat.nationalityID,
        name: nat.name,
      }));

      // 步驟 2: 轉換 (扁平化) API 資料以符合表格渲染
      const processedData = originalData.map((reason) => {
        const row: TableRow = {
          reasonId: reason.id,
          reasonName: reason.name,
          total: reason.total, // 這是行的 "小計"
        };
        reason.nationality.forEach((nat) => {
          // 創建唯一的 key，例如 'nat_1_naturalized'
          row[`nat_${nat.nationalityID}_naturalized`] = nat.naturalized;
          row[`nat_${nat.nationalityID}_not_naturalized`] =
            nat["not-naturalized"];
        });

        return row;
      });
      tableData.value = processedData;

      // 步驟 3: 計算頁腳的合計值
      const totals: TableRow = { reasonId: -1, reasonName: "合計", total: 0 };
      // 根據表頭初始化合計物件
      headerNationality.value.forEach((nat) => {
        totals[`nat_${nat.id}_naturalized`] = 0;
        totals[`nat_${nat.id}_not_naturalized`] = 0;
      });

      // 遍歷處理過的資料來累加計算總和
      processedData.forEach((row) => {
        totals.total += row.total;
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
    } else {
      if (responseData.data?.length === 0) {
        tableData.value = [];
        headerNationality.value = [];
      } else {
        throw new Error(responseData.message || "API 回應格式不正確或請求失敗");
      }
    }
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || "無法載入統計資料。";
    console.error("載入統計資料失敗:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
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
