<template>
  <div class="surface-card p-2 sm:p-4 shadow-2 border-round">
    <!-- 標題與操作區 -->
    <div
      class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h3 class="m-0 text-xl font-semibold">服務紀錄詳細資料</h3>
        <span class="text-color-secondary text-sm"
          >案件類型: {{ displayType }} / 案號: {{ casenumber }} / 紀錄ID:
          {{ recordid }}</span
        >
      </div>
      <div class="flex gap-2">
        <Button
          @click="goBack"
          class="p-button-secondary p-button-outlined p-button-sm"
          label="返回"
          icon="pi pi-arrow-left"
        />
        <!-- 如果需要編輯按鈕，可以在這裡加入 -->
        <!-- <Button
          @click="editRecord"
          class="p-button-primary p-button-sm"
          label="編輯紀錄"
          icon="pi pi-pencil"
        /> -->
      </div>
    </div>

    <!-- 狀態處理 -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-3 text-color-secondary">{{ loadingStatusText }}</p>
    </div>

    <div v-else-if="error" class="p-5">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <!-- 主要內容區 -->
    <div v-else>
      <div v-if="processedData && processedData.length > 0">
        <div class="grid detail-grid">
          <div
            v-for="item in processedData"
            :key="item.key"
            :class="item.isFullWidth ? 'col-12' : 'col-12 md:col-6 lg:col-4'"
          >
            <div class="detail-item-card p-2 md:p-3">
              <div class="text-color-secondary mb-1 item-title">
                {{ item.title }}
              </div>
              <div
                :class="item.isFullWidth ? 'text-base' : 'font-bold text-lg'"
                class="item-value"
              >
                <!-- 根據類型顯示不同樣式 -->
                <Tag
                  v-if="isTag(item.key)"
                  :severity="getTagSeverity(item.key, item.originalValue)"
                  :value="item.displayValue"
                />
                <Chip v-else-if="isChip(item.key)" :label="item.displayValue" />
                <span v-else class="pre-wrap">{{ item.displayValue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-color-secondary p-5 mt-3">
        <i class="pi pi-inbox mb-3" style="font-size: 3rem"></i>
        <p class="m-0">查無此服務紀錄的相關詳細資料。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";

// PrimeVue components
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Chip from "primevue/chip";
import Tag from "primevue/tag";

// --- TypeScript Interfaces ---
interface FieldConfig {
  key: string;
  title: string;
  isFullWidth?: boolean;
  dependsOn?: (recordData: any) => boolean;
}

// [新增] 為 optionMaps 定義一個介面，包含 workers
interface OptionMaps {
  nationalities: Map<number, string>;
  serviceMethods: Map<number, string>;
  serviceItems: Map<number, string>;
  workers: Map<string, string>; // 新增 workers Map
}

// --- Props ---
const props = defineProps<{
  type: string;
  casenumber: string;
  recordid: string | number;
}>();

const router = useRouter();
const typeMap: { [key: string]: string } = {
  general: "一般案件",
  arrival: "新入境案件",
};
const displayType = computed(() => {
  return typeMap[props.type] || props.type;
});

// --- 狀態變數 ---
const rawData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const loadingStatusText = ref("正在載入資料...");

// [修改] 使用新的介面並加入 workers
const optionMaps = ref<OptionMaps>({
  nationalities: new Map(),
  serviceMethods: new Map(),
  serviceItems: new Map(),
  workers: new Map(), // 初始化空的 workers Map
});
const areOptionsLoaded = ref(false);

// --- 輔助函式 ---
const isChip = (key: string) =>
  ["caseNumber", "filingDate", "gender"].includes(key);

// [修改] 將 author 從 Chip 移到一般文字顯示，因為我們現在要顯示全名
const isTag = (key: string) => ["nationalityID"].includes(key);

const getTagSeverity = (key: string, value: any) => {
  if ((key === "nationalityID" || key === "serviceMethodID") && value === -1)
    return "warn";
  return "info";
};

// [新增] 建立一個集中的社工姓名轉換函式
const getWorkerName = (workerId: any): string => {
  if (workerId === null || workerId === undefined || workerId === "") {
    return "未指定";
  }
  const key = String(workerId);
  return optionMaps.value.workers.get(key) || `未知社工 (${key})`;
};

// --- 核心邏輯：處理並格式化紀錄資料 ---
const processedData = computed(() => {
  if (!rawData.value?.data || !areOptionsLoaded.value) {
    return [];
  }

  const recordData = rawData.value.data;
  const genderMap: { [key: number]: string } = { 0: "男", 1: "女", 2: "其他" };

  const fieldsConfig: FieldConfig[] = [
    { key: "filingDate", title: "填寫日期" },
    { key: "caseNumber", title: "案件編號" },
    { key: "author", title: "填寫社工" },
    { key: "targets", title: "詳細服務對象" },
    { key: "serviceMethodID", title: "服務方式" },
    {
      key: "serviceMethodOther",
      title: "其他服務方式說明",
      dependsOn: (record) => record.serviceMethodID === -1,
    },
    { key: "taskObject", title: "工作目標", isFullWidth: true },
    { key: "detail", title: "服務內容", isFullWidth: true },
    { key: "serviceItems", title: "服務項目明細", isFullWidth: true },
  ];

  const dataArray = [];
  for (const field of fieldsConfig) {
    const value = recordData[field.key];

    if (field.dependsOn && !field.dependsOn(recordData)) {
      continue;
    }
    if (value === null || value === undefined || value === "") {
      continue;
    }

    let displayValue: any = value;

    switch (field.key) {
      // [新增] 新增 author 的 case 來轉換姓名
      case "author":
        displayValue = getWorkerName(value);
        break;
      case "gender":
        displayValue = genderMap[value as number] || "未知";
        break;
      case "nationalityID":
        displayValue =
          value === -1
            ? "其他"
            : optionMaps.value.nationalities.get(value as number) ||
              `ID: ${value}`;
        break;
      case "serviceMethodID":
        displayValue =
          value === -1
            ? "其他"
            : optionMaps.value.serviceMethods.get(value as number) ||
              `ID: ${value}`;
        break;
      case "targets":
        if (Array.isArray(value) && value.length > 0) {
          displayValue = value
            .map((item) => {
              const gender = genderMap[item.gender] || "未知性別";
              const nationality =
                item.nationalityID === -1
                  ? "其他"
                  : optionMaps.value.nationalities.get(item.nationalityID) ||
                    `國籍ID: ${item.nationalityID}`;
              return `${item.name} (${gender}, ${nationality})`;
            })
            .join("\n");
        } else {
          continue;
        }
        break;
      case "serviceItems":
        if (Array.isArray(value) && value.length > 0) {
          displayValue = value
            .map((item) => {
              const itemName =
                optionMaps.value.serviceItems.get(item.id) ||
                `項目ID: ${item.id}`;
              const extras = [];
              if (item.detail) extras.push(`說明: ${item.detail}`);
              if (item.unit) extras.push(`單位: ${item.unit}`);
              return extras.length > 0
                ? `${itemName} (${extras.join("、")})`
                : itemName;
            })
            .join("\n");
        } else {
          continue;
        }
        break;
    }

    dataArray.push({
      key: field.key,
      title: field.title,
      displayValue: displayValue,
      originalValue: value,
      isFullWidth: field.isFullWidth || false,
    });
  }

  return dataArray;
});

// --- 資料獲取 ---
const fetchOptionMaps = async () => {
  loadingStatusText.value = "正在載入選項對照表...";
  try {
    // [修改] 加入 workers 的 API 請求
    const [nationalitiesRes, serviceMethodsRes, serviceItemsRes, workersRes] =
      await Promise.all([
        apiHandler.get("/option/nationalities"),
        apiHandler.get("/option/serviceMethods"),
        apiHandler.get("/option/serviceItems"),
        apiHandler.get("/option/workers"), // 新增請求
      ]);
    optionMaps.value.nationalities = new Map(
      nationalitiesRes.data.data.map((i: any) => [i.id, i.name]),
    );
    optionMaps.value.serviceMethods = new Map(
      serviceMethodsRes.data.data.map((i: any) => [i.id, i.name]),
    );
    optionMaps.value.serviceItems = new Map(
      serviceItemsRes.data.data.map((i: any) => [i.id, i.name]),
    );
    // [修改] 將 workers 資料存入 Map
    optionMaps.value.workers = new Map(
      workersRes.data.data.map((i: any) => [i.name, i.fullName]),
    );

    areOptionsLoaded.value = true;
  } catch (err) {
    error.value = "讀取選項對照表失敗，部分資料可能顯示為 ID。";
    areOptionsLoaded.value = true;
  }
};

const fetchData = async (
  currentType: string,
  currentCasenumber: string,
  currentRecordid: string | number,
) => {
  loadingStatusText.value = "正在載入服務紀錄資料...";
  isLoading.value = true;
  error.value = null;
  rawData.value = null;

  try {
    const recordUrl = `/form/assign/${currentType}/${currentCasenumber}/record/${currentRecordid}`;
    const response = await apiHandler.get(recordUrl);

    if (response.data && response.data.success) {
      rawData.value = response.data;
    } else {
      throw new Error(response.data.message || "讀取服務紀錄詳細資料失敗");
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || "請求失敗";
  } finally {
    isLoading.value = false;
  }
};

// --- 生命週期鉤子 ---
onMounted(() => {
  const initialize = async () => {
    isLoading.value = true;
    await fetchOptionMaps();
    await fetchData(props.type, props.casenumber, props.recordid);
  };
  initialize();
});

watch(
  () => [props.type, props.casenumber, props.recordid] as const,
  ([newType, newCasenumber, newRecordid]) => {
    if (newType && newCasenumber && newRecordid) {
      fetchData(newType, newCasenumber, newRecordid);
    }
  },
);

// --- 頁面導航 ---
const goBack = () => router.go(-1);
</script>

<style scoped>
.detail-grid {
  row-gap: 0.1rem;
}
.detail-item-card {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  background-color: var(--surface-a);
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  min-height: 4.5rem; /* 確保卡片有基本高度 */
  justify-content: center; /* 垂直置中 */
}
.detail-item-card:hover {
  background-color: var(--surface-b);
}
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
.item-title {
  font-size: 0.875rem;
}
.item-value {
  word-break: break-word;
}
</style>
