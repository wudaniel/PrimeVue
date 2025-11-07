<template>
  <div class="surface-card p-2 sm:p-4 shadow-2 border-round">
    <!-- 標題與操作區 -->
    <div
      class="flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h3 class="m-0 text-xl font-semibold">案件詳細資料</h3>
        <span class="text-color-secondary text-sm"
          >案件類型: {{ displayType }} / 案號: {{ id }}</span
        >
      </div>
      <!-- [修改] 此處移除了下載按鈕 -->
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
      <!-- 案件詳細資料區塊 (此處無更動) -->
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
                  :label="String(item.displayValue ?? '')"
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

      <div class="mt-5">
        <!-- [修改] 使用 Flexbox 容器來對齊標題和按鈕 -->
        <div class="flex justify-content-between align-items-center mb-3">
          <h4 class="m-0 text-lg font-semibold">服務紀錄列表</h4>
          <!-- [移動] 將下載按鈕移動到此處 -->
          <Button
            @click="downloadSelectedRecords"
            :disabled="!selectedRecords || selectedRecords.length === 0"
            :loading="isDownloading"
            class="p-button-info p-button-sm"
            label="下載所選紀錄"
            icon="pi pi-download"
          />
        </div>

        <DataTable
          :value="records"
          responsiveLayout="scroll"
          :paginator="true"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20]"
          stripedRows
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageSelect"
          currentPageReportTemplate="顯示 {first} 到 {last} 項，共 {totalRecords} 項紀錄"
          v-model:selection="selectedRecords"
          dataKey="recordID"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="listID" header="編號" :sortable="true">
            <template #body="slotProps">
              <Button
                :label="slotProps.data.listID.toString()"
                @click="goToRecordDetail(slotProps.data.recordID)"
                class="p-button-link p-button-sm p-0"
              /> </template
          ></Column>
          <Column field="date" header="日期" :sortable="true"></Column>
          <Column field="author" header="填寫社工" :sortable="true">
            <template #body="slotProps">
              <span>{{ getWorkerName(slotProps.data.author) }}</span>
            </template>
          </Column>
          <Column field="target" header="服務目標" :sortable="true"></Column>
          <Column field="methodID" header="服務方式" :sortable="true">
            <template #body="slotProps">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";

import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Chip from "primevue/chip";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// 定義紀錄的 TypeScript 介面，方便類型檢查
interface Record {
  recordID: number;
  listID: number;
  [key: string]: any; // 其他屬性
}

interface OptionMaps {
  sourceCats: Map<number, string>;
  sources: Map<number, string>;
  nationalities: Map<number, string>;
  serviceMethods: Map<number, string>;
  needs: Map<number, string>;
  refusingReasons: Map<number, string>;
  closingReasons: Map<number, string>;
  workers: Map<string, string>;
  towns: Map<number, string>;
}

const props = defineProps<{
  type: string;
  id: string;
}>();

const router = useRouter();
const typeMap: { [key: string]: string } = {
  general: "一般案件",
  arrival: "新入境案件",
};
const displayType = computed(() => {
  return typeMap[props.type] || props.type;
});

const rawData = ref<any>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const loadingStatusText = ref("正在載入資料...");
const records = ref<Record[]>([]);

// [新增] 用於儲存勾選的紀錄和下載狀態
const selectedRecords = ref<Record[]>([]);
const isDownloading = ref(false);

const optionMaps = ref<OptionMaps>({
  sourceCats: new Map(),
  sources: new Map(),
  nationalities: new Map(),
  serviceMethods: new Map(),
  needs: new Map(),
  refusingReasons: new Map(),
  closingReasons: new Map(),
  workers: new Map(),
  towns: new Map(),
});
const areOptionsLoaded = ref(false);
const areDynamicOptionsLoaded = ref(false);

const isBoolean = (value: any) => typeof value === "boolean";
const isChip = (title: string) =>
  ["個案來源編號", "個案來源類別編號"].includes(title);

const getWorkerName = (workerId: any): string => {
  if (workerId === null || workerId === undefined || workerId === "") {
    return "未指定";
  }
  const key = String(workerId);
  return optionMaps.value.workers.get(key) || `未知社工 (${key})`;
};

const processedData = computed(() => {
  if (!rawData.value?.data || !areOptionsLoaded.value) {
    return [];
  }
  const caseData = rawData.value.data;
  const meta = rawData.value.meta;
  if (!areDynamicOptionsLoaded.value) {
    return [];
  }
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
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return null;
      }
      let displayValue: any = value;
      let title = meta[key] || key;
      let isFullWidth = key === "detail";

      if (["author", "worker", "workerID"].includes(key)) {
        displayValue = getWorkerName(value);
      } else if (key === "nationalityID" && typeof value === "number") {
        displayValue =
          optionMaps.value.nationalities.get(value) || displayValue;
      } else if (key === "sourceCatID" && typeof value === "number") {
        displayValue = optionMaps.value.sourceCats.get(value) || displayValue;
      } else if (key === "sourceID" && typeof value === "number") {
        displayValue = optionMaps.value.sources.get(value) || displayValue;
      } else if (key === "town" && typeof value === "number") {
        const townName = optionMaps.value.towns.get(value);
        if (townName && townName.includes("其他") && caseData.townOther) {
          displayValue = caseData.townOther;
        } else {
          displayValue = townName || `未知鄉鎮 (ID: ${value})`;
        }
      } else if (key === "needsID" && Array.isArray(value)) {
        const needsText = value
          .map((id) => optionMaps.value.needs.get(id))
          .filter(Boolean);
        displayValue = needsText.length > 0 ? needsText.join("、") : "無";
      } else if (key === "needsOther") {
        if (!caseData.needsID?.includes(-1)) return null;
        title = "需求服務 (其他說明)";
        isFullWidth = true;
      } else if (
        (key === "refusingReasonID" || key === "refusingID") &&
        (Array.isArray(value) || typeof value === "number")
      ) {
        title = meta[key] || "不開案原因";
        const reasonIDs = Array.isArray(value) ? value : [value];
        const reasonsText = reasonIDs
          .map((id) => optionMaps.value.refusingReasons.get(id))
          .filter(Boolean);
        displayValue = reasonsText.length > 0 ? reasonsText.join("、") : "無";
      } else if (key === "refusingReasonOther") {
        const refusingValue = caseData.refusingReasonID || caseData.refusingID;
        if (
          !refusingValue ||
          !(
            Array.isArray(refusingValue) ? refusingValue : [refusingValue]
          ).includes(-2)
        )
          return null;
        title = "不開案原因 (其他說明)";
        isFullWidth = true;
      } else if (
        key === "closingReasonID" &&
        (Array.isArray(value) || typeof value === "number")
      ) {
        title = meta[key] || "結案原因";
        const reasonIDs = Array.isArray(value) ? value : [value];
        const reasonsText = reasonIDs
          .map((id) => optionMaps.value.closingReasons.get(id))
          .filter(Boolean);
        displayValue = reasonsText.length > 0 ? reasonsText.join("、") : "無";
      } else if (key === "closingReasonOther") {
        const closingValue = caseData.closingReasonID;
        if (
          !closingValue ||
          !(
            Array.isArray(closingValue) ? closingValue : [closingValue]
          ).includes(-3)
        )
          return null;
        title = "結案原因 (其他說明)";
        isFullWidth = true;
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

      if (key === "refusingID") return null;
      return { key, title, displayValue, originalValue: value, isFullWidth };
    })
    .filter((item): item is NonNullable<typeof item> => {
      if (!item) return false;
      if (item.key === "townOther") return false;
      if (item.key === "refusingID" && caseData.refusingReasonID) return false;
      const val = item.originalValue;
      if (val === 0 && keysToKeepZero.includes(item.key)) return true;
      return !!val;
    });
});

const fetchStaticOptionMaps = async () => {
  loadingStatusText.value = "正在載入選項對照表...";
  try {
    const responses = await Promise.all([
      apiHandler.get("/option/sourceCats"),
      apiHandler.get("/option/sources"),
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      apiHandler.get("/option/workers"),
      apiHandler.get("/option/towns"),
    ]);
    const [
      sourceCatsRes,
      sourcesRes,
      nationalitiesRes,
      serviceMethodsRes,
      workersRes,
      townsRes,
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
    optionMaps.value.serviceMethods = new Map(
      serviceMethodsRes.data.data.map((item: any) => [item.id, item.name]),
    );
    optionMaps.value.workers = new Map(
      workersRes.data.data.map((item: any) => [item.name, item.fullName]),
    );
    optionMaps.value.towns = new Map(
      townsRes.data.data.map((item: any) => [item.id, item.name]),
    );

    areOptionsLoaded.value = true;
  } catch (err) {
    error.value = "讀取通用選項對照表失敗，部分資料可能顯示為 ID。";
    areOptionsLoaded.value = true;
  }
};

const fetchDynamicOptionMaps = async (caseData: any) => {
  loadingStatusText.value = "正在載入特定狀態選項...";
  const promises = [];

  const hasNeedsID =
    caseData.needsID &&
    Array.isArray(caseData.needsID) &&
    caseData.needsID.length > 0;
  if (caseData.status === 1 || hasNeedsID) {
    promises.push(
      apiHandler
        .get("/option/needs")
        .then((response) => {
          optionMaps.value.needs = new Map(
            response.data.data.map((item: any) => [item.id, item.name]),
          );
        })
        .catch((err) => {
          console.error("讀取 needs 選項失敗", err);
          optionMaps.value.needs = new Map();
        }),
    );
  }

  if (caseData.status === 2) {
    promises.push(
      apiHandler
        .get("/option/refusingReasons")
        .then((response) => {
          optionMaps.value.refusingReasons = new Map(
            response.data.data.map((item: any) => [item.id, item.name]),
          );
        })
        .catch((err) => {
          console.error("讀取 refusingReasons 選項失敗", err);
          optionMaps.value.refusingReasons = new Map();
        }),
    );
  }

  if (caseData.status === 3) {
    promises.push(
      apiHandler
        .get("/option/closingReasons")
        .then((response) => {
          optionMaps.value.closingReasons = new Map(
            response.data.data.map((item: any) => [item.id, item.name]),
          );
        })
        .catch((err) => {
          console.error("讀取 closingReasons 選項失敗", err);
          optionMaps.value.closingReasons = new Map();
        }),
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    error.value = "讀取動態選項時發生錯誤。";
  } finally {
    areDynamicOptionsLoaded.value = true;
  }
};

const fetchData = async (currentType: string, currentId: string) => {
  isLoading.value = true;
  error.value = null;
  rawData.value = null;
  records.value = [];
  selectedRecords.value = []; // [修改] 重置選項
  areDynamicOptionsLoaded.value = false;

  try {
    await fetchStaticOptionMaps();
    loadingStatusText.value = "正在載入案件資料與服務紀錄...";
    const detailUrl = `/form/assign/${currentType}/${currentId}`;
    const recordsUrl = `/form/assign/${currentType}/${currentId}/record`;
    const [detailResponse, recordsResponse] = await Promise.all([
      apiHandler.get(detailUrl),
      apiHandler.get(recordsUrl),
    ]);
    if (detailResponse.data?.success) {
      rawData.value = detailResponse.data;
    } else {
      throw new Error(detailResponse.data.message || "讀取案件詳細資料失敗");
    }
    if (recordsResponse.data?.success) {
      records.value = recordsResponse.data.data;
    }

    if (rawData.value?.data) {
      await fetchDynamicOptionMaps(rawData.value.data);
    } else {
      areDynamicOptionsLoaded.value = true;
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || "請求失敗";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData(props.type, props.id);
});

watch(
  () => [props.type, props.id],
  ([newType, newId]) => {
    if (newType && newId) {
      areDynamicOptionsLoaded.value = false;
      fetchData(newType, newId);
    }
  },
);

const goBack = () => router.go(-1);
const goToAddRecord = () => {
  let targetRouteName = "";
  if (props.type === "arrival") targetRouteName = "arrivalRecords";
  else if (props.type === "general") targetRouteName = "generalRecords";
  else {
    return;
  }
  router.push({
    name: targetRouteName,
    query: {
      caseNumber: props.id,
    },
  });
};
const goToRecordDetail = (recordId: string | number) => {
  let params = {
    type: props.type,
    casenumber: props.id,
    recordid: recordId,
  };

  router.push({
    name: "RecordsDetail",
    params: params,
  });
};

// [新增] 下載所選紀錄的函式
const downloadSelectedRecords = async () => {
  if (!selectedRecords.value || selectedRecords.value.length === 0) {
    return;
  }
  isDownloading.value = true;
  error.value = null;

  try {
    const recordIDs = selectedRecords.value.map((record) => record.recordID);
    const params = new URLSearchParams();
    params.append("formType", props.type);
    params.append("caseNumber", props.id);
    recordIDs.forEach((id) => {
      params.append("recordIDs[]", id.toString());
    });

    const url = `/export/docx?${params.toString()}`;

    // 發送請求，並指定回應類型為 blob (二進制文件)
    const response = await apiHandler.get(url, { responseType: "blob" });

    // 處理 blob 回應，觸發瀏覽器下載
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `案件_${props.id}_紀錄.docx`);
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    // 清空選擇
    selectedRecords.value = [];
  } catch (err: any) {
    error.value =
      "下載失敗：" + (err.response?.data?.message || err.message || "未知錯誤");
  } finally {
    isDownloading.value = false;
  }
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
