<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <!-- ... 頁面標題和按鈕 (已更新) ... -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="m-0 text-xl font-semibold">服務項目資料管理</h2>
        <p class="mt-1 text-color-secondary text-sm">
          您可以新增、編輯或切換狀態，完成後請點擊「儲存變更」。
        </p>
      </div>
      <Button
        @click="addNewServiceItem"
        label="新增服務項目"
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
        :value="allServiceItems"
        responsiveLayout="scroll"
        editMode="cell"
        @cell-edit-complete="onCellEditComplete"
        class="editable-cells"
        :pt="{
          bodyrow: ({ props }: BodyRowPassThroughProps) => ({
            class: {
              'deleted-row':
                props.rowData &&
                isMarkedForDeletion(props.rowData as ServiceItem),
            },
          }),
        }"
        dataKey="_ui_key"
      >
        <Column field="id" header="ID" style="width: 8%"></Column>

        <Column field="name" header="服務項目名稱" style="width: 29%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" autofocus class="w-full" />
          </template>
        </Column>

        <!-- [核心修改] 新增 extra 欄位 -->
        <Column field="extra" header="需額外資訊" style="width: 15%">
          <template #body="slotProps">
            <span
              :class="{
                'text-green-500': slotProps.data.extra === 1,
                'text-gray-500': slotProps.data.extra === 0,
              }"
            >
              {{ slotProps.data.extra === 1 ? "是" : "否" }}
            </span>
          </template>
          <template #editor="{ data, field }">
            <div class="flex justify-content-center">
              <label
                class="p-sr-only"
                :for="`service-item-extra-${data._ui_key ?? data.id}`"
              >
                需額外資訊
              </label>
              <ToggleSwitch
                :inputId="`service-item-extra-${data._ui_key ?? data.id}`"
                :modelValue="data[field] === 1"
                @update:modelValue="data[field] = $event ? 1 : 0"
              />
            </div>
          </template>
        </Column>

        <!-- [核心修改] 新增 type 欄位 -->
        <Column field="type" header="類型" style="width: 15%">
          <template #body="slotProps">
            {{ getTypeName(slotProps.data.type) }}
          </template>
          <template #editor="{ data, field }">
            <Dropdown
              v-model="data[field]"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </template>
        </Column>

        <Column field="visible" header="狀態" style="width: 13%">
          <template #body="slotProps">
            <div class="flex justify-content-center">
              <label
                class="p-sr-only"
                :for="`service-item-visible-${slotProps.data.id ?? slotProps.data._ui_key}`"
              >
                切換顯示狀態
              </label>
              <ToggleSwitch
                :inputId="`service-item-visible-${slotProps.data.id ?? slotProps.data._ui_key}`"
                :modelValue="slotProps.data.visible === 1"
                @update:modelValue="
                  (newValue: boolean) =>
                    updateVisibility(slotProps.data, newValue)
                "
                :disabled="isMarkedForDeletion(slotProps.data)"
              />
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
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";

// --- TypeScript 介面定義 (已更新) ---
interface ServiceItem {
  id: number;
  name: string;
  visible: number;
  extra: number;
  type: number;
  _ui_key: number | string;
}
interface UpsertPayload {
  id: number;
  name: string;
  visible: number;
  extra: number;
  type: number;
}
interface BodyRowPassThroughProps {
  props: {
    rowData: ServiceItem;
  };
}

// --- 狀態變數 ---
const originalServiceItems = ref<ServiceItem[]>([]);
const allServiceItems = ref<ServiceItem[]>([]);
const deletedIds = ref(new Set<number>());

const isLoading = ref(true);
const error = ref<string | null>(null);
const generatedPayload = ref<object | null>(null);
const isSaving = ref(false);
let uiKeyCounter = 0;

const toast = useToast();

// [核心修改] 定義類型選項
const typeOptions = ref([
  { label: "兩者皆要", value: 0 },
  { label: "一般", value: 1 },
  { label: "新入境", value: 2 },
]);

// --- 資料獲取邏輯 ---
const fetchServiceItems = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiHandler.get("/option/serviceItems?show_all=true");
    if (response.data?.success) {
      const rawData = response.data.data;
      const filteredData = rawData.filter(
        (item: { id: number }) => item.id > 0,
      );
      const processedData = filteredData.map(
        (item: Omit<ServiceItem, "_ui_key">) => ({
          ...item,
          _ui_key: item.id,
        }),
      );
      originalServiceItems.value = JSON.parse(JSON.stringify(processedData));
      allServiceItems.value = JSON.parse(JSON.stringify(processedData));
    } else {
      throw new Error(response.data.message || "未能獲取服務項目資料");
    }
  } catch (err: any) {
    error.value = err.message || "發生未知錯誤";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchServiceItems);

// --- 輔助及 UI 操作函式 ---
const getTypeName = (typeValue: number): string => {
  const option = typeOptions.value.find((opt) => opt.value === typeValue);
  return option ? option.label : "未知";
};

const isMarkedForDeletion = (item: ServiceItem) => {
  return item.id > 0 && deletedIds.value.has(item.id);
};

const addNewServiceItem = () => {
  allServiceItems.value.unshift({
    id: 0,
    name: "請輸入新服務項目",
    visible: 1,
    extra: 0, // 預設為否
    type: 0, // 預設為兩者皆要
    _ui_key: `new_${uiKeyCounter++}`,
  });
};

const onCellEditComplete = (event: DataTableCellEditCompleteEvent) => {
  const { data, newValue, field } = event;
  const item = allServiceItems.value.find((si) => si._ui_key === data._ui_key);
  if (item && field in item) {
    (item as any)[field] = newValue;
  }
};

const updateVisibility = (itemToUpdate: ServiceItem, newValue: boolean) => {
  const item = allServiceItems.value.find(
    (si) => si._ui_key === itemToUpdate._ui_key,
  );
  if (item) {
    item.visible = newValue ? 1 : 0;
  }
};

const markForDeletion = (item: ServiceItem) => {
  if (item.id > 0) {
    deletedIds.value.add(item.id);
  } else {
    allServiceItems.value = allServiceItems.value.filter(
      (si) => si._ui_key !== item._ui_key,
    );
  }
};

const undoDeletion = (item: ServiceItem) => {
  if (item.id > 0) {
    deletedIds.value.delete(item.id);
  }
};

const resetChanges = () => {
  allServiceItems.value = JSON.parse(
    JSON.stringify(originalServiceItems.value),
  );
  deletedIds.value.clear();
  generatedPayload.value = null;
};

// --- Payload 產生與提交函式 (已更新) ---
const prepareAndShowPayload = async () => {
  const upserts: UpsertPayload[] = [];
  allServiceItems.value.forEach((item) => {
    if (isMarkedForDeletion(item)) return;

    if (item.id === 0 && item.name !== "請輸入新服務項目") {
      upserts.push({
        id: 0,
        name: item.name,
        visible: item.visible,
        extra: item.extra,
        type: item.type,
      });
    } else {
      const originalItem = originalServiceItems.value.find(
        (si) => si._ui_key === item._ui_key,
      );
      if (
        originalItem &&
        (originalItem.name !== item.name ||
          originalItem.visible !== item.visible ||
          originalItem.extra !== item.extra ||
          originalItem.type !== item.type)
      ) {
        upserts.push({
          id: item.id,
          name: item.name,
          visible: item.visible,
          extra: item.extra,
          type: item.type,
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
    const response = await apiHandler.post("/option/serviceItems", payload);
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
  background-color: #ff0026 !important;
  color: #757575;
}
.deleted-row .p-cell-editor,
.deleted-row .p-inputswitch {
  opacity: 0.6;
  pointer-events: none;
}
</style>
