<template>
    <div>
      <!-- 主資料表格 (條件渲染) -->
      <div v-if="showMainTable">
        <DataTable
          :value="testdata"
          scrollable
          scrollHeight="400px"
          dataKey="id"  
          responsiveLayout="scroll"
          class="p-datatable-sm p-datatable-striped" 
        >
          <template #header>
             <!-- 如果需要可以放 DataTable 的 Header -->
          </template>
  
          <!-- ID 欄位 (可點擊) -->
          <Column field="id" header="ID" :sortable="true" style="min-width: 80px;">
            <template #body="slotProps">
              <span
                @click="handleIdClick(slotProps.data)"
                style="
                  cursor: pointer;
                  color: var(--p-primary-color); /* 使用 PrimeVue 主題色 */
                  text-decoration: underline;
                  font-weight: bold;
                "
                :title="`查看 ID ${slotProps.data.id} 的詳細資料`"
              >
                {{ slotProps.data.id }}
              </span>
            </template>
          </Column>
  
          <!-- 工作人員欄位 (條件顯示) -->
          <Column v-if="shouldShowWorkerColumn" field="worker" header="工作人員" :sortable="true">
             <template #body="slotProps">
               <i class="pi pi-user mr-1" style="vertical-align: middle;"></i>
               <span style="vertical-align: middle;">{{ slotProps.data.worker }}</span>
             </template>
          </Column>
  
          <!-- 狀態欄位 -->
          <Column field="status" header="狀態" :sortable="true" style="min-width: 120px;">
            <template #body="slotProps">
              <Chip :label="getStatusText(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" size="small" />
            </template>
          </Column>
  
          <!-- 類別欄位 -->
          <Column field="type" header="類別" :sortable="true" style="min-width: 120px;">
             <template #body="slotProps">
               <Chip :label="getTypeText(slotProps.data.type)" :severity="getTypeSeverity(slotProps.data.type)" size="small"/>
             </template>
          </Column>
  
          <!-- 日期欄位 -->
          <Column field="date" header="日期" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
  
          <template #empty>
            沒有可顯示的資料。
          </template>
        </DataTable>
      </div>
  
      <!-- 詳細資料視圖 (條件渲染) -->
      <div v-else>
        <Button
          @click="showMainTableView"
          class="mb-4 p-button-secondary p-button-sm" 
          label="返回列表"
          icon="pi pi-arrow-left"
        />
  
        <!-- 載入中提示 -->
        <div v-if="loadingDetailData" class="text-center pa-5">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" animationDuration=".5s"/>
          <p class="mt-4 text-grey">
            正在載入 ID {{ selectedItemId }} 的詳細資料...
          </p>
        </div>
  
        <!-- 錯誤提示 -->
        <div v-else-if="detailError" class="pa-5">
           <Message severity="error" :closable="false">{{ detailError }}</Message>
        </div>
  
        <!-- 顯示詳細資料區域 -->
        <!-- ***** 您需要根據您的 API 回應和需求修改此處 ***** -->
        <div v-else-if="detailData.length > 0">
          <Card class="mt-3">
             <template #title>
                詳細資料 (ID: {{ selectedItemId }})
             </template>
             <template #content>
                <!-- 模擬 v-list 顯示 -->
                <div class="detail-list">
                   <div v-for="(detailItem, index) in detailData" :key="index" class="detail-list-item">
                      <i class="pi pi-circle-fill mr-2" style="font-size: 0.7rem; color: var(--p-primary-color)"></i>
                      <div class="detail-content">
                         <div class="font-medium">{{ detailItem.title || `資料項 ${index + 1}` }}</div>
                         <div class="text-sm text-color-secondary">{{ detailItem.description || "無描述" }}</div>
                      </div>
                      <Chip :label="detailItem.value || 'N/A'" severity="info" size="small" class="ml-auto"/>
                   </div>
                </div>
  
                <!-- 範例 2: 如果詳細資料是表格，使用 PrimeVue DataTable -->
                <!--
                  <DataTable :value="detailData" :headers="detailHeaders" class="p-datatable-sm mt-3">
                     <Column field="someDetailField" header="某個欄位">
                        <template #body="slotProps">
                           格式化顯示... {{ slotProps.data.someDetailField }}
                        </template>
                     </Column>
                  </DataTable>
                -->
             </template>
          </Card>
        </div>
        <!-- ***** 修改結束 ***** -->
  
        <!-- 無詳細資料提示 -->
        <div v-else class="text-center text-grey pa-5 mt-3">
          <i class="pi pi-info-circle mb-2" style="font-size: 2rem;"></i>
          <p>沒有 ID {{ selectedItemId }} 的相關詳細資料。</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts"> // 建議使用 lang="ts" 以獲得更好的類型提示
  import { ref, onMounted, computed } from "vue";
  import { apiHandler } from "../class/apiHandler"; // 確認路徑正確
  import { SaveSession } from "../stores/auth"; // 確認路徑正確
  
  // --- PrimeVue 元件導入 ---
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Chip from 'primevue/chip';
  import Button from 'primevue/button';
  import ProgressSpinner from 'primevue/progressspinner';
  import Message from 'primevue/message';
  // import InlineMessage from 'primevue/inlinemessage'; // 另一個選項
  import Card from 'primevue/card';
  import Divider from 'primevue/divider'; // 如果需要分隔線
  
  // --- 狀態變數 (與原版相同) ---
  const testdata = ref([
    // ... 您的測試資料 ...
    { id: "1", worker: "worker01", status: 2, date: "2024-07-23T03:22:15Z", type: 1 }, { id: "2", worker: "worker02", status: 1, date: "2024-08-18T19:58:42Z", type: 2 }, { id: "3", worker: "worker03", status: 0, date: "2024-08-10T12:45:09Z", type: 1 }, { id: "4", worker: "worker04", status: 3, date: "2024-08-02T07:31:36Z", type: 2 }, { id: "5", worker: "worker05", status: 2, date: "2024-08-15T00:17:03Z", type: 1 }, { id: "6", worker: "worker06", status: 0, date: "2024-07-29T17:03:30Z", type: 2 }, { id: "7", worker: "worker07", status: 1, date: "2024-07-25T09:49:57Z", type: 1 }, { id: "8", worker: "worker08", status: 3, date: "2024-08-07T02:36:24Z", type: 2 }, { id: "9", worker: "worker09", status: 2, date: "2024-08-20T23:22:51Z", type: 1 }, { id: "10", worker: "worker10", status: 0, date: "2024-07-31T16:09:18Z", type: 2 }, // ... etc
  ]);
  const userStore = SaveSession();
  const showMainTable = ref(true);
  const selectedItemId = ref<string | null>(null); // 明確類型
  const detailData = ref<any[]>([]); // 根據 API 回應定義更精確的類型
  const loadingDetailData = ref(false);
  const detailError = ref<string | null>(null); // 明確類型
  
  // --- 對應關係與格式化 (文字部分不變) ---
  const statusMap: { [key: number]: string } = { 0: "未開案", 1: "已開案", 2: "不開案", 3: "已結案" };
  const typeMap: { [key: number]: string } = { 1: "一般", 2: "新入境" };
  
  const getStatusText = (status: number): string => statusMap[status] || "未知";
  const getTypeText = (type: number): string => typeMap[type] || "未知";
  
  // --- PrimeVue 嚴重性 (Severity) 轉換 ---
  type ChipSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | null; // Chip 的 Severity 類型
  
  const getStatusSeverity = (status: number): ChipSeverity => {
    switch (status) {
      case 0: return 'secondary'; // 未開案 -> 次要 (灰色系)
      case 1: return 'success';   // 已開案 -> 成功
      case 2: return 'warning';   // 不開案 -> 警告
      case 3: return 'contrast';  // 已結案 -> 使用 contrast 或其他定義的深色系
      default: return null;       // 未知 -> 預設樣式
    }
  };
  
  const getTypeSeverity = (type: number): ChipSeverity => {
    switch (type) {
      case 1: return 'info';    // 一般 -> 資訊
      case 2: return 'primary'; // 新入境 -> 主要
      default: return null;
    }
  };
  
  // --- 日期格式化 (不變) ---
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date
        .toLocaleString("zh-TW", { // 保持 locale 設定
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(/\//g, "-");
    } catch (e) {
      console.error("日期格式化錯誤:", e);
      return dateString;
    }
  };
  
  // --- 條件欄位顯示 ---
  const shouldShowWorkerColumn = computed(() => {
    const permission = userStore.userInfo?.permission;
    // 確保 permission 是數字且小於等於 10
    return typeof permission === 'number' && permission <= 10;
  });
  
  
  // --- 方法 (API 呼叫邏輯不變) ---
  const handleIdClick = async (item: any) => { // 使用 any 或更精確的行類型
    console.log("點擊的 ID:", item.id);
    console.log(item.type);
    const typeinclick = item.type;
    selectedItemId.value = item.id;
    showMainTable.value = false;
    loadingDetailData.value = true;
    detailData.value = [];
    detailError.value = null;
  
    try {
      const apitypeMap: { [key: number]: string } = { 1: "general", 2: "arrival" };
      const getApiTypeText = (type: number): string => apitypeMap[type] || "unknown"; // 修正函式名稱避免衝突
  
      // ***** API 端點和邏輯保持不變 *****
      const apiUrl = `/form/assign/${getApiTypeText(typeinclick)}/${item.id}`; // 假設 API 結構是 /form/assign/{type}/{id}
      console.log("正在呼叫詳細資料 API:", apiUrl);
      const response = await apiHandler.get(apiUrl);
      console.log("詳細資料 API 回應:", response.data);
  
      // ***** API 回應處理邏輯保持不變 *****
      if (Array.isArray(response.data)) {
        detailData.value = response.data;
      } else if (
        typeof response.data === "object" &&
        response.data !== null &&
        Array.isArray(response.data.details) // 假設可能的回應結構
      ) {
        detailData.value = response.data.details;
      } else if (typeof response.data === "object" && response.data !== null) {
         // 轉換物件為陣列顯示
         detailData.value = Object.entries(response.data).map(([key, value]) => {
             // 這裡可以加入更複雜的邏輯將 key 轉成可讀的 title
             const title = key.charAt(0).toUpperCase() + key.slice(1); // 簡單轉換
             const description = typeof value === 'object' ? JSON.stringify(value) : String(value);
             return {
                 title: title,
                 description: description, // 可以決定是否顯示描述
                 value: description.length > 50 ? description.substring(0, 47) + '...' : description // 簡單截斷
             };
         });
      } else {
        console.warn("從詳細資料 API 收到的資料格式非預期:", response.data);
        detailData.value = [];
      }
    } catch (err: any) { // 明確錯誤類型
      console.error("讀取詳細資料失敗:", err);
      detailError.value =
        err.response?.data?.message || err.message || "請求失敗，請稍後再試";
      detailData.value = [];
    } finally {
      loadingDetailData.value = false;
    }
  };
  
  // 返回主列表視圖 (不變)
  const showMainTableView = () => {
    showMainTable.value = true;
    selectedItemId.value = null;
    detailData.value = [];
    detailError.value = null;
  };
  
  // --- 生命週期鉤子 (API 呼叫邏輯不變) ---
  onMounted(() => {
    // 保持或修改初始數據加載邏輯
    // apiHandler.get("/form/assign/general/113A001").then((response) => {
    //   console.log(response);
    // });
    console.log("主列表組件已掛載 (PrimeVue)");
    // 如果需要從 API 加載 testdata，在此處執行
  });
  
  </script>
  
  <style scoped>
  /* PrimeVue DataTable 通常不需要太多自訂 scoped 樣式，
     可以透過 class="p-datatable-sm p-datatable-gridlines" 等調整 */
  
  .text-grey {
    color: var(--p-text-color-secondary); /* 使用 PrimeVue 主題變數 */
  }
  
  /* 模擬 v-list 的樣式 */
  .detail-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem; /* 項目間距 */
  }
  
  .detail-list-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--p-content-border-color); /* 使用主題邊框色 */
  }
  .detail-list-item:last-child {
    border-bottom: none;
  }
  
  .detail-content {
    flex-grow: 1;
    margin-right: 1rem; /* 與右側 Chip 的間距 */
  }
  
  .font-medium {
    font-weight: 500;
  }
  .text-sm {
    font-size: 0.875rem;
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
  .mr-2 {
      margin-right: 0.5rem;
  }
  .mb-2 {
      margin-bottom: 0.5rem;
  }
  .mb-4 {
      margin-bottom: 1rem; /* PrimeFlex mb-4 效果 */
  }
  .mt-3 {
      margin-top: 0.75rem; /* PrimeFlex mt-3 效果 */
  }
  .mt-4 {
      margin-top: 1rem; /* PrimeFlex mt-4 效果 */
  }
  .pa-5 {
      padding: 1.25rem; /* PrimeFlex pa-5 效果 */
  }
  .text-center {
      text-align: center;
  }
  
  /* 可以移除 Vuetify 特定的樣式，或根據需要調整 */
  </style>