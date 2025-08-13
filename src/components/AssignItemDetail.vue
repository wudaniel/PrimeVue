<template>
  <div class="surface-card p-4 shadow-2 border-round">
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

    <!-- 主要內容區 (保持不變) -->
    <div v-else-if="processedData && processedData.length > 0">
      <div class="grid detail-grid">
        <div
          v-for="item in processedData"
          :key="item.key"
          :class="item.isFullWidth ? 'col-12' : 'col-12 md:col-6 lg:col-4'"
        >
          <div class="detail-item-card p-3 h-full">
            <div class="text-sm text-color-secondary mb-1">
              {{ item.title }}
            </div>
            <div :class="item.isFullWidth ? 'text-base' : 'font-bold text-lg'">
              <Tag
                v-if="isBoolean(item.originalValue)"
                :severity="item.originalValue ? 'success' : 'danger'"
                :value="item.displayValue"
              />
              <Chip v-else-if="isChip(item.title)" :label="item.displayValue" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";

// 導入 PrimeVue 元件
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Chip from "primevue/chip";
import Tag from "primevue/tag";

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

// 移除了 towns 的對照表，因為不再需要
const optionMaps = ref({
  sourceCats: new Map<number, string>(),
  sources: new Map<number, string>(),
  nationalities: new Map<number, string>(),
});
const areOptionsLoaded = ref(false);

// --- 輔助函式 (用於模板) ---
const isBoolean = (value: any) => typeof value === "boolean";
// '鄉鎮' 已由 meta 對應，這裡直接用中文
const isChip = (title: string) =>
  ["主責社工", "個案來源編號", "鄉鎮", "國籍", "個案來源類別編號"].includes(
    title,
  );

// --- 核心邏輯：使用 computed 處理資料 ---
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
  const keysToKeepZero = ["status", "gender"];

  return Object.entries(caseData)
    .map(([key, value]) => {
      let displayValue = value;
      let title = meta[key] || key; // 先取得預設標題

      // 格式化特殊值
      if (key === "nationalityID" && typeof value === "number") {
        displayValue =
          optionMaps.value.nationalities.get(value) || displayValue;
      } else if (key === "sourceCatID" && typeof value === "number") {
        displayValue = optionMaps.value.sourceCats.get(value) || displayValue;
      } else if (key === "sourceID" && typeof value === "number") {
        displayValue = optionMaps.value.sources.get(value) || displayValue;
      } else if (value === -1) {
        displayValue = "其他";
      } else if (key === "status" && typeof value === "number") {
        displayValue = statusMap[value] || "未知狀態";
      } else if (key === "gender" && typeof value === "number") {
        displayValue = genderMap[value] || "未知性別";
      } else if (key === "naturalized" && typeof value === "boolean") {
        displayValue = value ? "是" : "否";
      }

      // --- 修改點 1: 處理 townOther 的標題 ---
      if (key === "townOther") {
        title = meta["town"] || "鄉鎮"; // 將 'townOther' 的標題強制設定為 'town' 的中文名
      }

      return {
        key: key,
        title: title,
        displayValue: displayValue,
        originalValue: value,
        isFullWidth: key === "detail",
      };
    })
    .filter((item) => {
      // --- 修改點 2: 過濾掉原始的 'town' 欄位 ---
      if (item.key === "town") {
        return false;
      }

      const val = item.originalValue;
      if (val === null || val === undefined || val === "") return false;
      if (val === 0 && keysToKeepZero.includes(item.key)) return true;
      if (val === 0) return false;
      return true;
    });
});

// --- 資料獲取 ---
const fetchOptionMaps = async () => {
  loadingStatusText.value = "正在載入選項對照表...";
  try {
    // --- 修改點 3: 移除對 towns API 的請求 ---
    const responses = await Promise.all([
      apiHandler.get("/option/sourceCats"),
      apiHandler.get("/option/sources"),
      apiHandler.get("/option/nationalities"),
    ]);

    const [sourceCatsRes, sourcesRes, nationalitiesRes] = responses;

    optionMaps.value.sourceCats = new Map(
      sourceCatsRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.sources = new Map(
      sourcesRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.nationalities = new Map(
      nationalitiesRes.data.data.map((item: any) => [item.id, item.name]),
    );

    areOptionsLoaded.value = true;
  } catch (err) {
    error.value = "讀取選項對照表失敗，部分資料可能顯示為 ID。";
    console.error("Fetch option maps failed:", err);
    areOptionsLoaded.value = true;
  }
};

const fetchData = async (currentType: string, currentId: string) => {
  loadingStatusText.value = "正在載入案件資料...";
  isLoading.value = true;
  error.value = null;
  rawData.value = null;
  try {
    const apiUrl = `/form/assign/${currentType}/${currentId}`;
    const response = await apiHandler.get(apiUrl);

    if (response.data && response.data.success) {
      rawData.value = response.data;
    } else {
      throw new Error(response.data.message || "API 回應格式錯誤");
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

// --- 頁面導航 (保持不變) ---
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
</script>

<style scoped>
/* 樣式保持不變 */
.detail-grid {
  row-gap: 1rem;
}
.detail-item-card {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  background-color: var(--surface-a);
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
}
.detail-item-card:hover {
  background-color: var(--surface-b);
}
.h-full {
  height: 100%;
}
.pre-wrap {
  white-space: pre-wrap;
}
</style>
