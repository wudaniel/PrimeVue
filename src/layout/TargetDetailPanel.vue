<template>
  <Panel :header="target.name || `對象 ${index + 1}`" toggleable>
    <!-- 對象基本資料 -->
    <div class="grid formgrid p-3">
      <div class="field col-12 md:col-4">
        <label class="font-semibold text-color-secondary">名稱</label>
        <div class="mt-1">{{ target.name || "N/A" }}</div>
      </div>
      <div class="field col-12 md:col-4">
        <label class="font-semibold text-color-secondary">性別</label>
        <div class="mt-1">{{ displayGender }}</div>
      </div>
      <div class="field col-12 md:col-4">
        <label class="font-semibold text-color-secondary">國籍</label>
        <div class="mt-1">{{ displayNationality }}</div>
      </div>
    </div>

    <!-- 服務項目區塊 -->
    <div
      v-if="
        (target.serviceItems && target.serviceItems.length > 0) ||
        target.serviceItemOther
      "
      class="mt-3 border-top-1 surface-border pt-3"
    >
      <h5 class="mt-0 mb-3 font-semibold">服務項目</h5>

      <!-- 顯示服務項目列表 -->
      <ul
        v-if="target.serviceItems && target.serviceItems.length > 0"
        class="list-none p-0 m-0"
      >
        <li v-for="item in target.serviceItems" :key="item.id" class="mb-2">
          <i class="pi pi-check-circle text-green-500 mr-2"></i>
          <strong>{{ getServiceItemName(item.id) }}</strong>
          <span
            v-if="item.detail || item.unit"
            class="text-sm text-color-secondary ml-2"
          >
            ({{ formatServiceItemExtras(item) }})
          </span>
        </li>
      </ul>

      <!-- 顯示其他服務項目 -->
      <div v-if="target.serviceItemOther" class="mt-3">
        <label class="font-semibold text-color-secondary"
          >其他服務項目說明</label
        >
        <p class="mt-1 p-2 bg-surface-100 border-round pre-wrap">
          {{ target.serviceItemOther }}
        </p>
      </div>
    </div>
    <div v-else class="mt-3 text-color-secondary">
      <p>此對象未記錄服務項目。</p>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import Panel from "primevue/panel";

// --- Interfaces ---
// 這些介面可以從您的表單元件或共用類型檔案中引入
interface ServiceItemDetail {
  id: number;
  unit?: string;
  detail?: string;
}
interface Target {
  name: string;
  gender: number;
  nationalityID: number;
  nationalityOther?: string; // API 回傳可能沒有此欄位，設為可選
  serviceItems: ServiceItemDetail[] | null;
  serviceItemOther: string | null;
}
interface OptionMaps {
  nationalities: Map<number, string>;
  serviceItems: Map<number, string>;
  // 您可以加入其他需要的 maps
}

// --- Props ---
const props = defineProps({
  target: {
    type: Object as PropType<Target>,
    required: true,
  },
  optionMaps: {
    type: Object as PropType<OptionMaps>,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

// --- Computed Properties for Display ---
const genderMap: { [key: number]: string } = { 0: "男", 1: "女", 2: "其他" };

const displayGender = computed(() => {
  return genderMap[props.target.gender] || "未知";
});

const displayNationality = computed(() => {
  if (props.target.nationalityID === -1) {
    // 假設 "其他" 的情況下，API 會回傳 nationalityOther 欄位
    return `其他 (${props.target.nationalityOther || "未提供說明"})`;
  }
  return (
    props.optionMaps.nationalities.get(props.target.nationalityID) ||
    `未知國籍 (ID: ${props.target.nationalityID})`
  );
});

// --- Helper Functions ---
const getServiceItemName = (id: number): string => {
  return props.optionMaps.serviceItems.get(id) || `未知項目 (ID: ${id})`;
};

const formatServiceItemExtras = (item: ServiceItemDetail): string => {
  const parts = [];
  if (item.unit) parts.push(`單位: ${item.unit}`);
  if (item.detail) parts.push(`內容: ${item.detail}`);
  return parts.join("、");
};
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
