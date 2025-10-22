<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <!-- ... 頁面標題和按鈕 ... -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="m-0 text-xl font-semibold">國籍資料管理</h2>
        <p class="mt-1 text-color-secondary text-sm">
          您可以新增、編輯或切換狀態，完成後請點擊「儲存變更」。
        </p>
      </div>
      <Button
        @click="addNewNationality"
        label="新增國籍"
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
        :value="allNationalities"
        responsiveLayout="scroll"
        editMode="cell"
        @cell-edit-complete="onCellEditComplete"
        class="editable-cells"
        :pt="{
          bodyrow: ({ props }: BodyRowPassThroughProps) => ({
            class: {
              'deleted-row':
                props.rowData &&
                isMarkedForDeletion(props.rowData as Nationality),
            },
          }),
        }"
        dataKey="_ui_key"
      >
        <Column field="id" header="ID" style="width: 10%"></Column>

        <Column field="name" header="國籍名稱" style="width: 50%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" autofocus class="w-full" />
          </template>
        </Column>

        <Column field="visible" header="狀態" style="width: 20%">
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <ToggleSwitch
                :modelValue="slotProps.data.visible === 1"
                @update:modelValue="
                  (newValue: boolean) =>
                    updateVisibility(slotProps.data, newValue)
                "
                :disabled="isMarkedForDeletion(slotProps.data)"
              />
              <span>{{ slotProps.data.visible === 1 ? "顯示" : "隱藏" }}</span>
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
        />
        <Button
          @click="prepareAndShowPayload"
          label="儲存變更"
          icon="pi pi-check"
          class="p-button-primary"
        />
      </div>
      <div v-if="generatedPayload" class="mt-4">
        <h4 class="font-semibold">生成的請求資料 (Payload):</h4>
        <pre
          class="surface-ground p-3 border-round text-sm white-space-pre-wrap"
          >{{ JSON.stringify(generatedPayload, null, 2) }}</pre
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiHandler } from "../../class/apiHandler";

// [核心修改] 從 PrimeVue 引入類型定義
import DataTable, {
  type DataTableCellEditCompleteEvent,
} from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";

// --- TypeScript 介面定義 ---
interface Nationality {
  id: number;
  name: string;
  visible: number;
  _ui_key: number | string;
}
interface UpsertPayload {
  id: number;
  name: string;
  visible: number;
}
interface BodyRowPassThroughProps {
  props: {
    rowData: Nationality;
  };
}

// --- 狀態變數 ---
const originalNationalities = ref<Nationality[]>([]);
const allNationalities = ref<Nationality[]>([]);
const deletedIds = ref(new Set<number>());

const isLoading = ref(true);
const error = ref<string | null>(null);
const generatedPayload = ref<object | null>(null);
let uiKeyCounter = 0;

// --- 資料獲取邏輯 ---
const fetchNationalities = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get(
      "/option/nationalities?show_all=true",
    );
    if (response.data?.success) {
      const rawData = response.data.data;
      const filteredData = rawData.filter(
        (item: { id: number }) => item.id !== -1,
      );
      const processedData = filteredData.map(
        (item: Omit<Nationality, "_ui_key">) => ({
          ...item,
          _ui_key: item.id,
        }),
      );
      originalNationalities.value = JSON.parse(JSON.stringify(processedData));
      allNationalities.value = JSON.parse(JSON.stringify(processedData));
    } else {
      throw new Error(response.data.message || "未能獲取國籍資料");
    }
  } catch (err: any) {
    error.value = err.message || "發生未知錯誤";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchNationalities);

// --- 輔助函式 ---
const isMarkedForDeletion = (item: Nationality) => {
  return item.id > 0 && deletedIds.value.has(item.id);
};

// --- UI 操作函式 ---
const addNewNationality = () => {
  allNationalities.value.unshift({
    id: 0,
    name: "請輸入新國籍",
    visible: 1,
    _ui_key: `new_${uiKeyCounter++}`,
  });
};

// [核心修改] 為 event 參數添加類型
const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
  const { data, newValue, field } = event;
  const item = allNationalities.value.find((n) => n._ui_key === data._ui_key);
  if (item && field in item) {
    // 使用 (item as any) 來處理動態 key 的賦值
    (item as any)[field] = newValue;
  }
};

// [核心修改] 為 newValue 參數添加類型
const updateVisibility = (itemToUpdate: Nationality, newValue: boolean) => {
  const item = allNationalities.value.find(
    (n) => n._ui_key === itemToUpdate._ui_key,
  );
  if (item) {
    item.visible = newValue ? 1 : 0;
  }
};

const markForDeletion = (item: Nationality) => {
  if (item.id > 0) {
    deletedIds.value.add(item.id);
  } else {
    allNationalities.value = allNationalities.value.filter(
      (n) => n._ui_key !== item._ui_key,
    );
  }
};

const undoDeletion = (item: Nationality) => {
  if (item.id > 0) {
    deletedIds.value.delete(item.id);
  }
};

const resetChanges = () => {
  allNationalities.value = JSON.parse(
    JSON.stringify(originalNationalities.value),
  );
  deletedIds.value.clear();
  generatedPayload.value = null;
};

// --- 核心：產生 Payload 的函式 ---
const prepareAndShowPayload = () => {
  const upserts: UpsertPayload[] = [];
  allNationalities.value.forEach((item) => {
    if (isMarkedForDeletion(item)) return;
    if (item.id === 0) {
      upserts.push({ id: 0, name: item.name, visible: item.visible });
    } else {
      const originalItem = originalNationalities.value.find(
        (n) => n._ui_key === item._ui_key,
      );
      if (
        !originalItem ||
        originalItem.name !== item.name ||
        originalItem.visible !== item.visible
      ) {
        upserts.push({ id: item.id, name: item.name, visible: item.visible });
      }
    }
  });
  const deletes = Array.from(deletedIds.value);
  const payload = {
    upserts,
    deletes,
  };
  generatedPayload.value = payload;
  console.log("準備提交的 Payload:", payload);
};
</script>

<style>
.editable-cells .p-editable-column {
  cursor: pointer;
}
.deleted-row {
  text-decoration: line-through;
  background-color: #ff0000 !important;
  color: #888;
}
.deleted-row .p-cell-editor,
.deleted-row .p-inputswitch {
  opacity: 0.6;
  pointer-events: none;
}
</style>
