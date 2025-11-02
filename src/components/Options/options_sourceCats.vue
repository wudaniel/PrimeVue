<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <!-- ... 頁面標題和按鈕 (已更新) ... -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="m-0 text-xl font-semibold">案主來源類別資料管理</h2>
        <p class="mt-1 text-color-secondary text-sm">
          您可以新增、編輯或切換狀態，完成後請點擊「儲存變更」。
        </p>
      </div>
      <Button
        @click="addNewSourceCat"
        label="新增來源類別"
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
        :value="allSourceCats"
        responsiveLayout="scroll"
        editMode="cell"
        @cell-edit-complete="onCellEditComplete"
        class="editable-cells"
        :pt="{
          bodyrow: ({ props }: BodyRowPassThroughProps) => ({
            class: {
              'deleted-row':
                props.rowData &&
                isMarkedForDeletion(props.rowData as SourceCat),
            },
          }),
        }"
        dataKey="_ui_key"
      >
        <Column field="id" header="ID" style="width: 10%"></Column>

        <Column field="name" header="來源類別名稱" style="width: 50%">
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
import router from "../../router";

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
import { useToast } from "primevue/usetoast";

// --- TypeScript 介面定義 (已更新) ---
interface SourceCat {
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
    rowData: SourceCat;
  };
}

// --- 狀態變數 (已更新) ---
const originalSourceCats = ref<SourceCat[]>([]);
const allSourceCats = ref<SourceCat[]>([]);
const deletedIds = ref(new Set<number>());

const isLoading = ref(true);
const error = ref<string | null>(null);
const generatedPayload = ref<object | null>(null);
const isSaving = ref(false);
let uiKeyCounter = 0;

const toast = useToast();

// --- 資料獲取邏輯 (已更新) ---
const fetchSourceCats = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/option/sourceCats?show_all=true");
    if (response.data?.success) {
      const rawData = response.data.data;
      const filteredData = rawData.filter(
        (item: { id: number }) => item.id > 0,
      );
      const processedData = filteredData.map(
        (item: Omit<SourceCat, "_ui_key">) => ({
          ...item,
          _ui_key: item.id,
        }),
      );
      originalSourceCats.value = JSON.parse(JSON.stringify(processedData));
      allSourceCats.value = JSON.parse(JSON.stringify(processedData));
    } else {
      throw new Error(response.data.message || "未能獲取來源類別資料");
    }
  } catch (err: any) {
    error.value = err.message || "發生未知錯誤";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSourceCats);

// --- 輔助及 UI 操作函式 (已更新) ---
const isMarkedForDeletion = (item: SourceCat) => {
  return item.id > 0 && deletedIds.value.has(item.id);
};

const addNewSourceCat = () => {
  allSourceCats.value.unshift({
    id: 0,
    name: "請輸入新來源類別",
    visible: 1,
    _ui_key: `new_${uiKeyCounter++}`,
  });
};

const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
  const { data, newValue, field } = event;
  const item = allSourceCats.value.find((sc) => sc._ui_key === data._ui_key);
  if (item && field in item) {
    (item as any)[field] = newValue;
  }
};

const updateVisibility = (itemToUpdate: SourceCat, newValue: boolean) => {
  const item = allSourceCats.value.find(
    (sc) => sc._ui_key === itemToUpdate._ui_key,
  );
  if (item) {
    item.visible = newValue ? 1 : 0;
  }
};

const markForDeletion = (item: SourceCat) => {
  if (item.id > 0) {
    deletedIds.value.add(item.id);
  } else {
    allSourceCats.value = allSourceCats.value.filter(
      (sc) => sc._ui_key !== item._ui_key,
    );
  }
};

const undoDeletion = (item: SourceCat) => {
  if (item.id > 0) {
    deletedIds.value.delete(item.id);
  }
};

const resetChanges = () => {
  allSourceCats.value = JSON.parse(JSON.stringify(originalSourceCats.value));
  deletedIds.value.clear();
  generatedPayload.value = null;
};

// --- Payload 產生與提交函式 (已更新) ---
const prepareAndShowPayload = async () => {
  const upserts: UpsertPayload[] = [];
  allSourceCats.value.forEach((item) => {
    if (isMarkedForDeletion(item)) return;

    if (item.id === 0 && item.name !== "請輸入新來源類別") {
      upserts.push({ id: 0, name: item.name, visible: item.visible });
    } else {
      const originalItem = originalSourceCats.value.find(
        (sc) => sc._ui_key === item._ui_key,
      );
      if (
        originalItem &&
        (originalItem.name !== item.name ||
          originalItem.visible !== item.visible)
      ) {
        upserts.push({ id: item.id, name: item.name, visible: item.visible });
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
    const response = await apiHandler.post("/option/sourceCats", payload);
    if (response.data?.success) {
      toast.add({
        severity: "success",
        summary: "成功",
        detail: "變更已成功儲存！",
        life: 1500,
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
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
  } finally {
    isSaving.value = false;
  }
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
