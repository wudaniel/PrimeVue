<template>
  <div class="card p-4">
    <h3 class="text-xl font-bold text-center mb-4">結案分析</h3>
    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
      <p class="mt-2">正在載入統計資料...</p>
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
    <div v-else>
      <DataTable
        :value="tableData"
        responsiveLayout="scroll"
        showGridlines
        class="p-datatable-sm"
        removableSort
      >
        <!-- 項次 -->

        <!-- 未開案原因 -->
        <Column
          field="reasonName"
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
          style="width: 20%"
        ></Column>

        <!-- 使用 ColumnGroup 定義與欄位完美對齊的頁腳 (合計行) -->
        <ColumnGroup type="footer">
          <Row>
            <!-- 
              使用 colspan="2" 將前兩個欄位合併成一個儲存格，
              並設定文字靠右對齊，更符合一般表格習慣
            -->
            <Column
              footer="合計"
              :colspan="1"
              footerStyle="text-align: left; padding-left: 1.5rem;"
            />
            <!-- 在第三個欄位的位置顯示計算好的總數 -->
            <Column :footer="grandTotal.toString()" footerClass="text-center" />
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
import { ref, onMounted, computed } from "vue";
import { apiHandler } from "../../class/apiHandler"; // 請確保路徑正確

// PrimeVue 元件
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";

// --- 類型定義 ---
interface RefusingReason {
  id: number;
  listID: number;
  name: string;
  total: number;
}

// --- 響應式狀態 ---
const tableData = ref<RefusingReason[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// ★ 使用 computed 屬性動態計算總計 ★
// 這樣當 tableData 變化時，grandTotal 會自動更新
const grandTotal = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.total, 0);
});

// --- 資料獲取 ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/report/general/closingReason");
    const responseData = response.data;

    if (responseData && responseData.success) {
      tableData.value = responseData.data;
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
  fetchData();
});
</script>

<style scoped>
/* 讓合計行 (tfoot) 的文字加粗並給予一個淡淡的背景色，使其更突出 */
:deep(.p-datatable-tfoot > tr > td) {
  font-weight: bold;
  background-color: var(--surface-100);
}

/* 確保表頭文字置中 */
:deep(.p-datatable .p-column-header-content) {
  justify-content: center;
}

/* 讓"未開案原因"的文字可以自動換行，避免過長時版面跑掉 */
:deep(.reason-cell) {
  white-space: normal;
  word-break: break-word;
}
</style>
