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
        <li v-for="item in target.serviceItems" :key="item.id" class="mb-3">
          <div class="flex align-items-center">
            <i class="pi pi-check-circle text-green-500 mr-2"></i>
            <strong>{{ getServiceItemName(item.id) }}</strong>
          </div>

          <!-- [修改] extras 顯示區塊 -->
          <div v-if="item.extras && item.extras.length > 0" class="pl-5 mt-2">
            <!-- 1. 外層容器改為 grid -->
            <div class="grid">
              <!-- 2. v-for 迴圈現在創建的是網格欄位 -->
              <div
                v-for="(extra, extraIndex) in item.extras"
                :key="extraIndex"
                class="col-12 md:col-6 p-1"
              >
                <!-- 3. 內容框放在欄位內部，並加上 h-full 確保同行等高 -->
                <div class="p-2 border-round border-1 surface-border h-full">
                  <div class="grid text-sm">
                    <div class="col-12 sm:col-3 text-color-secondary">
                      單位 (#{{ extraIndex + 1 }}):
                    </div>
                    <div class="col-12 sm:col-9 font-medium">
                      {{ extra.unit }}
                    </div>
                    <div class="col-12 sm:col-3 text-color-secondary">
                      內容:
                    </div>
                    <div class="col-12 sm:col-9 font-medium pre-wrap">
                      {{ extra.detail }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- 顯示其他服務項目 (無變化) -->
      <div v-if="target.serviceItemOther" class="mt-3">
        <div class="flex align-items-center">
          <i class="pi pi-info-circle text-yellow-500 mr-2"></i>
          <strong>其他服務項目說明</strong>
        </div>
        <p class="mt-1 ml-5 p-2 bg-surface-100 border-round pre-wrap">
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

// --- ★★★ 3. 更新 TypeScript Interfaces ★★★ ---
interface ExtraDetail {
  unit: string;
  detail: string;
}

interface ServiceItem {
  id: number;
  extras: ExtraDetail[] | null;
}

interface Target {
  name: string;
  gender: number;
  nationalityID: number;
  nationalityOther?: string;
  serviceItems: ServiceItem[] | null;
  serviceItemOther: string | null;
}

interface OptionMaps {
  nationalities: Map<number, string>;
  serviceItems: Map<number, string>;
}

// --- Props (介面更新) ---
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

// --- Computed Properties (無變化) ---
const genderMap: { [key: number]: string } = { 0: "男", 1: "女", 2: "其他" };

const displayGender = computed(() => {
  return genderMap[props.target.gender] || "未知";
});

const displayNationality = computed(() => {
  if (props.target.nationalityID === -1) {
    return `其他 (${props.target.nationalityOther || "未提供說明"})`;
  }
  return (
    props.optionMaps.nationalities.get(props.target.nationalityID) ||
    `未知國籍 (ID: ${props.target.nationalityID})`
  );
});

// --- Helper Functions (移除不再需要的函式) ---
const getServiceItemName = (id: number): string => {
  return props.optionMaps.serviceItems.get(id) || `未知項目 (ID: ${id})`;
};

// ★★★ 4. 移除 formatServiceItemExtras 函式 ★★★
// (因為我們現在用巢狀迴圈來顯示，不再需要這個函式)
// const formatServiceItemExtras = ...
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
