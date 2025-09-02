<template>
  <div>
    <DataTable
      :value="cases"
      :lazy="true"
      :paginator="true"
      :rows="10"
      :total-records="totalRecords"
      :loading="loading"
      @page="onPage($event)"
      ref="dt"
    >
      <Column field="caseNumber" header="案號" sortable></Column>
      <Column field="status" header="狀態" sortable></Column>
      <Column field="category" header="類別" sortable></Column>
      <Column field="user" header="使用者" sortable></Column>
      <Column field="creationDate" header="建立日期" sortable></Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { apiHandler } from "../class/apiHandler";

// --- 1. 狀態管理 ---
const cases = ref([]); // 存放從 API 取得的當頁資料
const loading = ref(false); // 控制載入狀態
const totalRecords = ref(0); // 總記錄數
const lazyParams = ref({}); // 存放分頁、排序等狀態

// --- 2. 載入資料的 API 呼叫函式 ---
const loadLazyData = async () => {
  loading.value = true;

  // 組合 API 請求參數
  const params = new URLSearchParams();
  params.append("page", lazyParams.value.page + 1); // PrimeVue 的 page 從 0 開始，API 可能習慣從 1 開始
  params.append("limit", lazyParams.value.rows);
  if (lazyParams.value.sortField) {
    params.append("sortBy", lazyParams.value.sortField);
    params.append(
      "sortOrder",
      lazyParams.value.sortOrder === 1 ? "asc" : "desc",
    );
  }
  // 在這裡也可以加上過濾的參數
  // params.append('status', lazyParams.value.filters.status.value);

  // 模擬 API 呼叫
  // 在真實世界中，你會使用 fetch 或 axios
  const response = await fetch(`/api/cases?${params.toString()}`);
  const result = await response.json();

  // 更新資料
  cases.value = result.data;
  totalRecords.value = result.pagination.totalItems;
  loading.value = false;
};

// --- 3. PrimeVue 事件處理函式 ---
// 當使用者點擊分頁、排序時，此函式會被觸發
const onPage = (event) => {
  // PrimeVue 會傳入一個包含所有狀態的事件物件
  // event 物件可能包含：{ first: 0, rows: 10, page: 0, sortField: 'caseNumber', sortOrder: 1, filters: {} }
  lazyParams.value = event;
  loadLazyData();
};

// --- 4. 元件掛載後，進行首次資料載入 ---
onMounted(async () => {
  const response = await apiHandler.get("report/NationalityToIdentity");
  console.log(response);
  // 初始化 lazyParams，觸發第一次載入
  lazyParams.value = {
    first: 0,
    rows: 10,
    sortField: "creationDate", // 預設排序欄位
    sortOrder: -1, // -1 代表 desc, 1 代表 asc
  };
  loadLazyData();
});
</script>
