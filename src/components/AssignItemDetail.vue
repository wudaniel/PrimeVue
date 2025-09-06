<template>
  <div class="surface-card p-2 sm:p-4 shadow-2 border-round">
    <!-- 標題與操作區 (保持不變) -->
    <div
      class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h3 class="m-0 text-xl font-semibold">案件詳細資料</h3>
        <span class="text-color-secondary text-sm"
          >案件類型: {{ type }} / 案號: {{ id }}</span
        >
      </div>
      <div class="flex gap-2">
        <Button
          @click="goBack"
          class="p-button-secondary p-button-outlined p-button-sm"
          label="返回列表"
          icon="pi pi-arrow-left"
        />
        <Button
          @click="goToAddRecord"
          class="p-button-success p-button-sm"
          label="新增紀錄"
          icon="pi pi-plus"
        />
      </div>
    </div>

    <!-- 狀態處理 (保持不變) -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-3 text-color-secondary">{{ loadingStatusText }}</p>
    </div>

    <div v-else-if="error" class="p-5">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
    <div v-else>
      <!-- 案件詳細資料區塊 -->
      <div v-if="processedData && processedData.length > 0">
        <div class="grid detail-grid">
          <div
            v-for="item in processedData"
            :key="item.key"
            :class="item.isFullWidth ? 'col-12' : 'col-12 lg:col-6 xl:col-3'"
          >
            <div class="detail-item-card p-2 md:p-3">
              <div class="text-color-secondary mb-1 item-title">
                {{ item.title }}
              </div>
              <div
                :class="item.isFullWidth ? 'text-base' : 'font-bold text-lg'"
                class="item-value"
              >
                <span v-if="item.key === 'naturalized'" class="pre-wrap">{{
                  item.displayValue
                }}</span>
                <Tag
                  v-else-if="isBoolean(item.originalValue)"
                  :severity="item.originalValue ? 'success' : 'danger'"
                  :value="item.displayValue"
                />
                <Chip
                  v-else-if="isChip(item.title)"
                  :label="item.displayValue"
                />
                <span v-else class="pre-wrap">{{ item.displayValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-color-secondary p-5 mt-3">
        <i class="pi pi-inbox mb-3" style="font-size: 3rem"></i>
        <p class="m-0">查無此案件的相關詳細資料。</p>
      </div>

      <!-- --- 新增：服務紀錄列表區塊 --- -->
      <div class="mt-5">
        <h4 class="m-0 mb-3 text-lg font-semibold">服務紀錄列表</h4>
        <DataTable
          :value="records"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          stripedRows
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="顯示 {first} 到 {last} 項，共 {totalRecords} 項紀錄"
        >
          <Column field="recordID" header="紀錄ID" :sortable="true"></Column>
          <Column field="date" header="日期" :sortable="true"></Column>
          <Column field="author" header="社工" :sortable="true"></Column>
          <Column field="methodID" header="服務方式" :sortable="true">
            <template #body="slotProps">
              <!-- 
                  這裡使用三元運算子來判斷：
                  1. 如果 methodID 是 -1，就顯示 '其他'。
                  2. 否則，就去 optionMaps 裡面找對應的名稱。
                  3. 如果找不到對應名稱 (以防萬一)，就顯示 '未知'。
                -->
              <span>
                {{
                  slotProps.data.methodID === -1
                    ? "其他"
                    : optionMaps.serviceMethods.get(slotProps.data.methodID) ||
                      "未知"
                }}
              </span>
            </template>
          </Column>

          <template #empty>
            <div class="text-center text-color-secondary p-4">尚無服務紀錄</div>
          </template>
        </DataTable>
      </div>
      <!-- --- 新增區塊結束 --- -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";

// --- 修改：導入新增的 DataTable 元件 ---
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Chip from "primevue/chip";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const props = defineProps<{
  type: string;
  id: string;
}>();

const router = useRouter();

// --- 狀態變數 ---
const rawData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const loadingStatusText = ref("正在載入資料...");
// --- 新增：一個 ref 來儲存服務紀錄列表 ---
const records = ref<any[]>([]);

const optionMaps = ref({
  sourceCats: new Map<number, string>(),
  sources: new Map<number, string>(),
  nationalities: new Map<number, string>(),
  needs: new Map<number, string>(),
  // --- 新增：服務方式的對照表 ---
  serviceMethods: new Map<number, string>(),
});
const areOptionsLoaded = ref(false);

// --- 輔助函式 (保持不變) ---
const isBoolean = (value: any) => typeof value === "boolean";
const isChip = (title: string) =>
  ["主責社工", "個案來源編號", "鄉鎮", "國籍", "個案來源類別編號"].includes(
    title,
  );

// --- 核心邏輯 (保持不變) ---
const processedData = computed(() => {
  if (!rawData.value?.data || !rawData.value?.meta || !areOptionsLoaded.value) {
    return [];
  }
  const caseData = rawData.value.data;
  const meta = rawData.value.meta;
  const statusMap: { [key: number]: string } = {
    0: "未開案",
    1: "已開案",
    2: "不開案",
    3: "已結案",
  };
  const genderMap: { [key: number]: string } = { 0: "男", 1: "女", 2: "其他" };
  const keysToKeepZero = ["status", "gender", "yearOfBirth"];

  return Object.entries(caseData)
    .map(([key, value]) => {
      let displayValue = value;
      let title = meta[key] || key;
      if (key === "nationalityID" && typeof value === "number") {
        displayValue =
          optionMaps.value.nationalities.get(value) || displayValue;
      } else if (key === "sourceCatID" && typeof value === "number") {
        displayValue = optionMaps.value.sourceCats.get(value) || displayValue;
      } else if (key === "sourceID" && typeof value === "number") {
        displayValue = optionMaps.value.sources.get(value) || displayValue;
      } else if (key === "needsID" && Array.isArray(value)) {
        const needsText: string[] = [];
        value.forEach((id) => {
          if (id !== -1) {
            const needName = optionMaps.value.needs.get(id);
            if (needName) needsText.push(needName);
          }
        });
        if (value.includes(-1) && caseData.needsOther) {
          needsText.push(caseData.needsOther);
        }
        displayValue = needsText.length > 0 ? needsText.join("、") : "無";
      } else if (value === -1) {
        displayValue = "其他";
      } else if (key === "status" && typeof value === "number") {
        displayValue = statusMap[value] || "未知狀態";
      } else if (key === "gender" && typeof value === "number") {
        displayValue = genderMap[value] || "未知性別";
      } else if (key === "naturalized" && typeof value === "boolean") {
        displayValue = value ? "是" : "否";
      } else if (key === "yearOfBirth" && value === 0) {
        displayValue = "N/A";
      }
      if (key === "townOther") {
        title = meta["town"] || "鄉鎮";
      }
      return {
        key,
        title,
        displayValue,
        originalValue: value,
        isFullWidth: key === "detail",
      };
    })
    .filter((item) => {
      if (item.key === "town" || item.key === "needsOther") return false;
      const val = item.originalValue;
      if (val === null || val === undefined || val === "") return false;
      if (Array.isArray(val) && val.length === 0) return false;
      if (val === 0 && keysToKeepZero.includes(item.key)) return true;
      if (val === 0) return false;
      return true;
    });
});

// --- 資料獲取 ---
const fetchOptionMaps = async () => {
  loadingStatusText.value = "正在載入選項對照表...";
  try {
    const responses = await Promise.all([
      apiHandler.get("/option/sourceCats"),
      apiHandler.get("/option/sources"),
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/needs"),
      // --- 修改：同時獲取服務方式的對照表 ---
      apiHandler.get("/option/serviceMethods"),
    ]);
    const [
      sourceCatsRes,
      sourcesRes,
      nationalitiesRes,
      needsRes,
      serviceMethodsRes,
    ] = responses;
    optionMaps.value.sourceCats = new Map(
      sourceCatsRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.sources = new Map(
      sourcesRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.nationalities = new Map(
      nationalitiesRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.needs = new Map(
      needsRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.serviceMethods = new Map(
      serviceMethodsRes.data.data.map((item: any) => [item.id, item.name]),
    );
    areOptionsLoaded.value = true;
  } catch (err) {
    error.value = "讀取選項對照表失敗，部分資料可能顯示為 ID。";
    console.error("Fetch option maps failed:", err);
    areOptionsLoaded.value = true;
  }
};

const fetchData = async (currentType: string, currentId: string) => {
  loadingStatusText.value = "正在載入案件資料與服務紀錄...";
  isLoading.value = true;
  error.value = null;
  rawData.value = null;
  records.value = []; // 清空舊資料
  try {
    // --- 修改：使用 Promise.all 同時發送兩個 API 請求 ---
    const detailUrl = `/form/assign/${currentType}/${currentId}`;
    const recordsUrl = `/form/assign/${currentType}/${currentId}/record`;
    const [detailResponse, recordsResponse] = await Promise.all([
      apiHandler.get(detailUrl),
      apiHandler.get(recordsUrl),
    ]);

    // 處理案件詳細資料
    if (detailResponse.data && detailResponse.data.success) {
      rawData.value = detailResponse.data;
    } else {
      throw new Error(detailResponse.data.message || "讀取案件詳細資料失敗");
    }

    // 處理服務紀錄列表
    if (recordsResponse.data && recordsResponse.data.success) {
      records.value = recordsResponse.data.data;
    } else {
      console.warn("讀取服務紀錄列表失敗:", recordsResponse.data.message);
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || "請求失敗";
    console.error("讀取資料失敗:", err);
  } finally {
    isLoading.value = false;
  }
};

// --- 生命週期鉤子 (保持不變) ---
onMounted(() => {
  const initialize = async () => {
    isLoading.value = true;
    await fetchOptionMaps();
    await fetchData(props.type, props.id);
    isLoading.value = false;
  };
  initialize();
});

watch(
  () => [props.type, props.id],
  ([newType, newId]) => {
    if (newType && newId) {
      fetchData(newType, newId);
    }
  },
);

// --- 頁面導航 ---
const goBack = () => router.go(-1);
const goToAddRecord = () => {
  let targetRouteName = "";
  if (props.type === "arrival") targetRouteName = "arrivalRecords";
  else if (props.type === "general") targetRouteName = "generalRecords";
  else {
    console.error("未知的類型:", props.type);
    return;
  }
  router.push({ name: targetRouteName, query: { caseNumber: props.id } });
};

// --- 新增：導航到紀錄詳細頁的函式 ---
// 請根據您的路由設定修改此函式
const goToRecordDetail = (recordId: string | number) => {
  console.log(`準備導航到紀錄 ${recordId}`);
  // 範例: router.push({ name: 'recordDetail', params: { id: recordId } });
};
</script>

<style scoped>
.detail-grid {
  row-gap: 0.1rem;
}
.detail-item-card {
  border: 1px solid var(--surface-border);
  border-block-color: gray;
  border-radius: var(--border-radius);
  background-color: var(--surface-a);
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem;
}
.detail-item-card:hover {
  background-color: var(--surface-b);
}
.pre-wrap {
  white-space: pre-wrap;
}
.item-value {
  word-break: break-word;
}
</style>
