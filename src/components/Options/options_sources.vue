<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <!-- ... 頁面標題和按鈕 ... -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="m-0 text-xl font-semibold">轉介單位</h2>
        <p class="mt-1 text-color-secondary text-sm">
          您可以點擊文字去新增、編輯或切換狀態，完成後請點擊「儲存變更」。
        </p>
      </div>
      <Button
        @click="addNewSource"
        label="新增個案來源"
        icon="pi pi-plus"
        class="p-button-success"
      />
    </div>

    <!-- ... 狀態處理 ... -->
    <div v-if="isLoading" class="text-center p-5">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="p-5">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div v-else>
      <DataTable
        :value="allSources"
        responsiveLayout="scroll"
        editMode="cell"
        @cell-edit-complete="onCellEditComplete"
        class="editable-cells"
        :pt="{
          bodyrow: ({ props }: BodyRowPassThroughProps) => ({
            class: {
              'deleted-row':
                props.rowData && isMarkedForDeletion(props.rowData as Source),
            },
          }),
        }"
        dataKey="_ui_key"
      >
        <Column field="id" header="ID" style="width: 8%"></Column>

        <Column field="name" header="案主來源名稱" style="width: 32%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" autofocus class="w-full" />
          </template>
        </Column>

        <!-- [核心修改] 新增來源類別欄位 -->
        <Column field="sourceCatID" header="來源類別" style="width: 20%">
          <template #body="slotProps">
            {{ getCategoryName(slotProps.data.sourceCatID) }}
          </template>
          <template #editor="{ data, field }">
            <Dropdown
              v-model="data[field]"
              :options="serviceCats"
              optionLabel="name"
              optionValue="id"
              placeholder="選擇類別"
              class="w-full"
            />
          </template>
        </Column>

        <Column field="visible" header="狀態" style="width: 20%">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <ToggleSwitch
                :inputId="`sources-visible-${slotProps.data.id}`"
                :modelValue="slotProps.data.visible === 1"
                @update:modelValue="
                  (newValue: boolean) =>
                    updateVisibility(slotProps.data, newValue)
                "
                :disabled="isMarkedForDeletion(slotProps.data)"
              />
              <label :for="`sources-visible-${slotProps.data.id}`">
                {{ slotProps.data.visible === 1 ? "顯示" : "隱藏" }}
              </label>
            </div>
          </template>
        </Column>

        <Column header="操作" style="width: 20%">
          <template #body="slotProps">
            <Button
              v-if="!isMarkedForDeletion(slotProps.data)"
              @click="markForDeletion(slotProps.data)"
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
            />
            <Button
              v-else
              @click="undoDeletion(slotProps.data)"
              label="恢復"
              icon="pi pi-undo"
              class="p-button-rounded p-button-secondary p-button-sm"
            />
          </template>
        </Column>
      </DataTable>

      <!-- ... 提交按鈕和 JSON 顯示 ... -->
      <div class="mt-4 flex justify-content-end gap-2">
        <Button
          @click="resetChanges"
          label="重設變更"
          class="p-button-secondary"
          :disabled="isSaving"
        />
        <Button
          @click="prepareAndShowPayload"
          label="儲存變更"
          icon="pi pi-check"
          class="p-button-primary"
          :loading="isSaving"
          :disabled="isSaving"
        />
      </div>
      <!--
      <div v-if="generatedPayload" class="mt-4">
        <h4 class="font-semibold">生成的請求資料 (Payload):</h4>
        <pre
          class="surface-ground p-3 border-round text-sm white-space-pre-wrap"
          >{{ JSON.stringify(generatedPayload, null, 2) }}</pre
        >
      </div>
    --></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler";

// PrimeVue 引入
import DataTable, {
  type DataTableCellEditCompleteEvent,
} from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";
import Dropdown from "primevue/dropdown"; // [核心修改] 引入 Dropdown
import { useToast } from "primevue/usetoast";

// --- TypeScript 介面定義 (已更新) ---
interface Source {
  id: number;
  name: string;
  visible: number;
  sourceCatID: number; // [核心修改] 新增欄位
  _ui_key: number | string;
}
interface UpsertPayload {
  id: number;
  name: string;
  visible: number;
  sourceCatID: number; // [核心修改] 新增欄位
}
interface ServiceCat {
  id: number;
  name: string;
}
interface BodyRowPassThroughProps {
  props: {
    rowData: Source;
  };
}

// --- 狀態變數 (已更新) ---
const originalSources = ref<Source[]>([]);
const allSources = ref<Source[]>([]);
const serviceCats = ref<ServiceCat[]>([]); // [核心修改] 新增狀態來儲存類別
const deletedIds = ref(new Set<number>());

const isLoading = ref(true);
const error = ref<string | null>(null);
const generatedPayload = ref<object | null>(null);
const isSaving = ref(false);
let uiKeyCounter = 0;

const toast = useToast();

// --- 資料獲取邏輯 (已更新) ---
const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // [核心修改] 使用 Promise.all 同時獲取兩個 API 的資料
    const [sourcesResponse, serviceCatsResponse] = await Promise.all([
      apiHandler.get("/option/sources?show_all=true"),
      apiHandler.get("/option/sourceCats?show_all=true"),
    ]);

    // 處理 Service Cats 資料
    if (serviceCatsResponse.data?.success) {
      serviceCats.value = serviceCatsResponse.data.data.filter(
        (cat: { id: number }) => cat.id !== 0,
      );
    } else {
      throw new Error(
        serviceCatsResponse.data.message || "未能獲取來源類別資料",
      );
    }

    // 處理 Sources 資料
    if (sourcesResponse.data?.success) {
      const rawData = sourcesResponse.data.data;
      const filteredData = rawData.filter(
        (item: { id: number }) => item.id > 0,
      );
      const processedData = filteredData.map(
        (item: Omit<Source, "_ui_key">) => ({
          ...item,
          _ui_key: item.id,
        }),
      );
      originalSources.value = JSON.parse(JSON.stringify(processedData));
      allSources.value = JSON.parse(JSON.stringify(processedData));
    } else {
      throw new Error(sourcesResponse.data.message || "未能獲取案主來源資料");
    }
  } catch (err: any) {
    error.value = err.message || "發生未知錯誤";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

// --- 輔助及 UI 操作函式 (已更新) ---
// [核心修改] 新增輔助函式，用 ID 找類別名稱
const getCategoryName = (catId: number): string => {
  const category = serviceCats.value.find((cat) => cat.id === catId);
  return category ? category.name : "未分類";
};

const isMarkedForDeletion = (item: Source) => {
  return item.id > 0 && deletedIds.value.has(item.id);
};

const addNewSource = () => {
  // 新增時，預設選取第一個類別
  const defaultCatId =
    serviceCats.value.length > 0 ? serviceCats.value[0].id : 0;
  allSources.value.unshift({
    id: 0,
    name: "請輸入新案主來源",
    visible: 1,
    sourceCatID: defaultCatId, // [核心修改]
    _ui_key: `new_${uiKeyCounter++}`,
  });
};

const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
  const { data, newValue, field } = event;
  const item = allSources.value.find((s) => s._ui_key === data._ui_key);
  if (item && field in item) {
    (item as any)[field] = newValue;
  }
};

const updateVisibility = (itemToUpdate: Source, newValue: boolean) => {
  const item = allSources.value.find((s) => s._ui_key === itemToUpdate._ui_key);
  if (item) {
    item.visible = newValue ? 1 : 0;
  }
};

const markForDeletion = (item: Source) => {
  if (item.id > 0) {
    deletedIds.value.add(item.id);
  } else {
    allSources.value = allSources.value.filter(
      (s) => s._ui_key !== item._ui_key,
    );
  }
};

const undoDeletion = (item: Source) => {
  if (item.id > 0) {
    deletedIds.value.delete(item.id);
  }
};

const resetChanges = () => {
  allSources.value = JSON.parse(JSON.stringify(originalSources.value));
  deletedIds.value.clear();
  generatedPayload.value = null;
};

// --- Payload 產生與提交函式 (已更新) ---
const prepareAndShowPayload = async () => {
  const upserts: UpsertPayload[] = [];
  allSources.value.forEach((item) => {
    if (isMarkedForDeletion(item)) return;

    if (item.id === 0 && item.name !== "請輸入新案主來源") {
      upserts.push({
        id: 0,
        name: item.name,
        visible: item.visible,
        sourceCatID: item.sourceCatID,
      });
    } else {
      const originalItem = originalSources.value.find(
        (s) => s._ui_key === item._ui_key,
      );
      // [核心修改] 檢查 sourceCatID 是否有變更
      if (
        originalItem &&
        (originalItem.name !== item.name ||
          originalItem.visible !== item.visible ||
          originalItem.sourceCatID !== item.sourceCatID)
      ) {
        upserts.push({
          id: item.id,
          name: item.name,
          visible: item.visible,
          sourceCatID: item.sourceCatID,
        });
      }
    }
  });

  const deletes = Array.from(deletedIds.value);

  if (upserts.length === 0 && deletes.length === 0) {
    toast.add({
      severity: "info",
      summary: "提示",
      detail: "沒有偵測到任何變更",
      life: 3000,
    });
    return;
  }

  const payload = {
    upserts,
    deletes,
  };
  generatedPayload.value = payload;
  isSaving.value = true;

  try {
    const response = await apiHandler.post("/option/sources", payload);
    if (response.data?.success) {
      toast.add({
        severity: "success",
        summary: "成功",
        detail: "變更已成功儲存！",
        life: 1500,
      });
    } else {
      throw new Error(response.data?.message || "儲存失敗");
    }
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "儲存失敗",
      detail: err.message || "發生未知錯誤，請稍後再試。",
      life: 4000,
    });
    isSaving.value = false;
  }
  // 注意：成功時的 isSaving 會在跳轉後自然消失，但如果選擇不跳轉，
  // 則需要在 setTimeout 之前或之後手動設為 false。
  // 為了保持跳轉邏輯的一致性，我們只在 catch 中設置 isSaving = false。
};
</script>

<style>
.editable-cells .p-editable-column {
  cursor: pointer;
}
.deleted-row {
  text-decoration: line-through;
  background-color: #ff0026 !important;
  color: #757575;
}
.deleted-row .p-cell-editor,
.deleted-row .p-inputswitch {
  opacity: 0.6;
  pointer-events: none;
}
</style>
