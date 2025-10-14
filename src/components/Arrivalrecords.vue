<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- 表單上半部分 (建檔日, 案號等) 保持不變 -->
        <div class="field col-12 md:col-6">
          <label for="filingDate"
            >建檔日: <span class="text-red-500">*</span></label
          >
          <Calendar
            id="filingDate"
            v-model="filingDate"
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="YYYY-MM-DD"
            class="w-full"
            :class="{ 'p-invalid': !!filingDateError }"
          />
          <small class="p-error" v-if="filingDateError">{{
            filingDateError
          }}</small>
        </div>
        <div class="field col-12 md:col-6">
          <label for="caseNumber"
            >案號: <span class="text-red-500">*</span></label
          >
          <InputText
            id="caseNumber"
            v-model="caseNumber"
            placeholder="案號"
            class="w-full"
            :class="{ 'p-invalid': !!caseNumberError }"
          />
          <small class="p-error" v-if="caseNumberError">{{
            caseNumberError
          }}</small>
        </div>

        <div class="col-12">
          <div class="flex justify-content-between align-items-center mb-2">
            <label class="font-bold"
              >對象: <span class="text-red-500">*</span></label
            >
            <div>
              <Button
                icon="pi pi-plus"
                class="p-button-success mr-2"
                @click="addTarget"
                type="button"
                v-tooltip.top="'新增對象'"
              />
              <Button
                icon="pi pi-minus"
                class="p-button-danger"
                @click="removeLastTarget"
                type="button"
                :disabled="targetFields.length === 0"
                v-tooltip.top="'移除最後一個對象'"
              />
            </div>
          </div>
          <small class="p-error mb-2" v-if="targetArrayError">{{
            targetArrayError
          }}</small>

          <!-- 使用 v-for 渲染每個對象的表單 -->
          <div
            v-for="(field, idx) in targetFields"
            :key="field.key"
            class="p-3 border-1 surface-border border-round mb-3"
          >
            <h4 class="mt-0 mb-3">對象 {{ idx + 1 }}</h4>
            <div class="grid formgrid">
              <!-- 對象姓名 -->
              <div class="field col-12 md:col-4">
                <label :for="`target-name-${idx}`"
                  >名稱: <span class="text-red-500">*</span></label
                >
                <InputText
                  :id="`target-name-${idx}`"
                  v-model="field.value.name"
                  placeholder="對象名稱"
                  class="w-full"
                  :class="{ 'p-invalid': !!targetErrors[idx]?.name }"
                />
                <small class="p-error" v-if="targetErrors[idx]?.name">{{
                  targetErrors[idx]?.name
                }}</small>
              </div>

              <!-- 對象性別 -->
              <div class="field col-12 md:col-4">
                <label class="mb-2 block"
                  >性別: <span class="text-red-500">*</span></label
                >
                <div class="flex flex-wrap gap-3">
                  <div class="flex align-items-center">
                    <RadioButton
                      :inputId="`male-${idx}`"
                      :name="`gender-${field.key}`"
                      :value="0"
                      v-model="field.value.gender"
                    /><label :for="`male-${idx}`" class="ml-2">男</label>
                  </div>
                  <div class="flex align-items-center">
                    <RadioButton
                      :inputId="`female-${idx}`"
                      :name="`gender-${field.key}`"
                      :value="1"
                      v-model="field.value.gender"
                    /><label :for="`female-${idx}`" class="ml-2">女</label>
                  </div>
                </div>
                <small class="p-error mt-1" v-if="targetErrors[idx]?.gender">{{
                  targetErrors[idx]?.gender
                }}</small>
              </div>

              <!-- 對象國籍 -->
              <div class="field col-12 md:col-4">
                <label :for="`target-nationality-${idx}`"
                  >國籍: <span class="text-red-500">*</span></label
                >
                <Dropdown
                  :inputId="`target-nationality-${idx}`"
                  v-model="field.value.nationalityID"
                  :options="nationalityList"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="請選擇國籍"
                  class="w-full"
                  filter
                  :class="{ 'p-invalid': !!targetErrors[idx]?.nationalityID }"
                />
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.nationalityID"
                  >{{ targetErrors[idx]?.nationalityID }}</small
                >
              </div>

              <!-- 對象其他國籍 -->
              <div class="field col-12" v-if="field.value.nationalityID === -1">
                <label :for="`target-other-nationality-${idx}`"
                  >請輸入其他國籍: <span class="text-red-500">*</span></label
                >
                <Textarea
                  :id="`target-other-nationality-${idx}`"
                  v-model="field.value.nationalityOther"
                  class="w-full"
                  :class="{
                    'p-invalid': !!targetErrors[idx]?.nationalityOther,
                  }"
                  rows="1"
                  autoResize
                />
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.nationalityOther"
                  >{{ targetErrors[idx]?.nationalityOther }}</small
                >
              </div>
            </div>
          </div>
        </div>

        <div class="field col-12 md:col-6">
          <label for="serviceMethodsDropdown"
            >服務方式: <span class="text-red-500">*</span></label
          >
          <Dropdown
            inputId="serviceMethodsDropdown"
            v-model="selectedServicemethods"
            :options="serviceMethodsList"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇服務方式"
            class="w-full"
            filter
            :class="{ 'p-invalid': !!servicemethodsError }"
          />
          <small class="p-error" v-if="servicemethodsError">{{
            servicemethodsError
          }}</small>
        </div>
        <div class="field col-12 md:col-6" v-if="selectedServicemethods === -1">
          <label for="otherServicemethods"
            >請輸入其他服務方式: <span class="text-red-500">*</span></label
          >
          <Textarea
            id="otherServicemethods"
            v-model="otherServicemethods"
            class="w-full"
            :class="{ 'p-invalid': !!dynamicErrors.otherServicemethods }"
            rows="1"
            autoResize
          />
          <small class="p-error" v-if="dynamicErrors.otherServicemethods">{{
            dynamicErrors.otherServicemethods
          }}</small>
        </div>
        <div class="field col-12">
          <label for="taskObject">工作目標:</label>
          <Textarea
            id="taskObject"
            v-model="taskObject"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': !!taskObjectError }"
            placeholder="工作目標"
            autoResize
          />
          <small class="p-error" v-if="taskObjectError">{{
            taskObjectError
          }}</small>
        </div>
        <div class="field col-12">
          <label for="detail">處遇摘要及評估:</label>
          <Textarea
            id="detail"
            v-model="detail"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': !!detailError }"
            placeholder="處遇摘要及評估"
            autoResize
          />
          <small class="p-error" v-if="detailError">{{ detailError }}</small>
        </div>
        <div class="field col-12">
          <label>服務項目: <span class="text-red-500">*</span></label>
          <div
            class="grid mt-2"
            :class="{
              'border-2 border-red-500 border-round p-1': !!serviceItemError,
            }"
          >
            <div
              v-for="item in serviceObjectList"
              :key="item.id"
              class="col-12 md:col-3 p-1"
            >
              <div class="flex align-items-center">
                <Checkbox
                  :inputId="'serviceItem-' + item.id"
                  name="serviceItems"
                  :value="item.id"
                  v-model="selectedserviceItem"
                />
                <label :for="'serviceItem-' + item.id" class="ml-2">{{
                  item.name
                }}</label>
              </div>
            </div>
          </div>
          <small class="p-error" v-if="serviceItemError">{{
            serviceItemError
          }}</small>
        </div>

        <div class="col-12">
          <div class="grid formgrid">
            <div
              v-for="extra in selectedExtraItems"
              :key="extra.id"
              class="col-12 md:col-6 lg:col-4"
            >
              <div class="p-3 border-1 surface-border border-round h-full">
                <h4 class="mt-0 mb-3">{{ extra.name }}</h4>
                <div class="field">
                  <label :for="'unit-' + extra.id"
                    >單位: <span class="text-red-500">*</span></label
                  >
                  <InputText
                    :id="'unit-' + extra.id"
                    v-model="extraInputValues[extra.id].unit"
                    placeholder="請輸入單位"
                    class="w-full"
                    :class="{
                      'p-invalid': !!dynamicErrors[`extraUnit_${extra.id}`],
                    }"
                  />
                  <small
                    class="p-error"
                    v-if="dynamicErrors[`extraUnit_${extra.id}`]"
                    >{{ dynamicErrors[`extraUnit_${extra.id}`] }}</small
                  >
                </div>
                <div class="field">
                  <label :for="'content-' + extra.id"
                    >內容: <span class="text-red-500">*</span></label
                  >
                  <Textarea
                    :id="'content-' + extra.id"
                    v-model="extraInputValues[extra.id].content"
                    placeholder="請輸入內容"
                    rows="3"
                    autoResize
                    class="w-full"
                    :class="{
                      'p-invalid': !!dynamicErrors[`extraContent_${extra.id}`],
                    }"
                  />
                  <small
                    class="p-error"
                    v-if="dynamicErrors[`extraContent_${extra.id}`]"
                    >{{ dynamicErrors[`extraContent_${extra.id}`] }}</small
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field col-12" v-if="isserviceItemOtherSelected">
          <label for="otherserviceItem"
            >請輸入其他需求：<span class="text-red-500">*</span></label
          >
          <Textarea
            id="otherserviceItem"
            v-model="otherserviceItem"
            class="w-full"
            :class="{ 'p-invalid': !!dynamicErrors.otherserviceItem }"
            rows="3"
            autoResize
          />
          <small class="p-error" v-if="dynamicErrors.otherserviceItem">{{
            dynamicErrors.otherserviceItem
          }}</small>
        </div>

        <div class="field col-12 flex justify-content-end">
          <Button
            type="submit"
            label="提交"
            icon="pi pi-check"
            :disabled="!isFormPotentiallyValid && meta.touched"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, reactive } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

// --- PrimeVue Components ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";

// --- VeeValidate ---
import { useForm, useField, useFieldArray } from "vee-validate";

import { defineRule } from "vee-validate";

defineRule("required", (value: any) => {
  // 檢查 value 是否有效 (不為空值、undefined、null，且允許數字 0)
  if (!value && value !== 0) {
    return "此欄位為必填";
  }
  return true; // 驗證通過
});

// --- Type Definitions (無變動) ---
interface SelectOption {
  id: number;
  name: string;
}
interface ServiceObjectOption extends SelectOption {
  extra?: boolean;
}
interface ExtraInput {
  unit: string;
  content: string;
}
interface Target {
  name: string;
  gender: number | null;
  nationalityID: number | null;
  nationalityOther: string;
}

// --- Hooks (無變動) ---
const toast = useToast();
const router = useRouter();

// --- Props (無變動) ---
const props = defineProps<{
  caseNumberQuery?: string;
}>();

// --- Form State ---
const { handleSubmit, meta } = useForm({});
const isSubmitting = ref(false);

// ★★★ 修改點 3: 移除 useField 中的 `label` 屬性，因為不再需要了 ★★★
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
  { initialValue: props.caseNumberQuery || "" }, // 保留 initialValue
);

const { fields: targetFields, push, remove } = useFieldArray<Target>("targets");

// 自訂驗證函式的錯誤訊息不受影響，維持原樣
const { errorMessage: targetArrayError } = useField<Target[]>(
  "targets",
  (value) => (value && value.length > 0 ? true : "請至少新增一個對象"),
  { initialValue: [] },
);

const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("serviceMethod", "required");
const { value: taskObject, errorMessage: taskObjectError } =
  useField<string>("taskObject");
const { value: detail, errorMessage: detailError } = useField<string>("detail");
const { value: selectedserviceItem, errorMessage: serviceItemError } = useField<
  number[]
>(
  "serviceItemID",
  (value) => (value && value.length > 0 ? true : "請選擇至少一個服務項目"),
  { initialValue: [] },
);

// --- Manually Handled Fields (無變動) ---
const otherServicemethods = ref("");
const otherserviceItem = ref("");
const extraInputValues = reactive<Record<number, ExtraInput>>({});
const dynamicErrors = reactive<Record<string, string | null>>({});
const targetErrors = reactive<Array<Partial<Record<keyof Target, string>>>>([]);

// --- API Data (無變動) ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- Computed Properties & Methods (無變動) ---
const selectedExtraItems = computed(() => {
  const selectedIds = selectedserviceItem.value ?? [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
});
const isserviceItemOtherSelected = computed(
  () => selectedserviceItem.value?.includes(-1) ?? false,
);
const isFormPotentiallyValid = computed(() => {
  const hasDynamicErrors = Object.values(dynamicErrors).some(
    (error) => error !== null,
  );
  const hasTargetItemErrors = targetErrors.some(
    (err) => Object.keys(err).length > 0,
  );
  return meta.value.valid && !hasDynamicErrors && !hasTargetItemErrors;
});

const addTarget = () => {
  push({
    name: "新住民女性",
    gender: 1,
    nationalityID: -1,
    nationalityOther: "烏托邦",
  });
  targetErrors.push({});
};

const removeLastTarget = () => {
  if (targetFields.value.length > 0) {
    remove(targetFields.value.length - 1);
    targetErrors.pop();
  }
};

// --- Watcher (無變動) ---
watch(
  selectedExtraItems,
  (newItems, oldItems = []) => {
    const currentExtraIds = new Set(newItems.map((item) => item.id));
    newItems.forEach((item) => {
      if (!extraInputValues[item.id]) {
        extraInputValues[item.id] = { unit: "", content: "" };
      }
    });
    oldItems.forEach((item) => {
      if (!currentExtraIds.has(item.id)) {
        delete extraInputValues[item.id];
        delete dynamicErrors[`extraUnit_${item.id}`];
        delete dynamicErrors[`extraContent_${item.id}`];
      }
    });
  },
  { deep: true },
);

// --- onMounted Hook (無變動) ---
onMounted(async () => {
  try {
    const [natRes, metRes, sobjRes] = await Promise.all([
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      apiHandler.get("/option/serviceItems"),
    ]);
    nationalityList.value = natRes.data.data ?? [];
    serviceMethodsList.value = metRes.data.data ?? [];
    serviceObjectList.value = sobjRes.data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch options:", error);
    toast.add({
      severity: "error",
      summary: "資料載入失敗",
      detail: "無法載入表單選項，請刷新頁面再試。",
      life: 3000,
    });
  }
});

// --- onSubmit (無變動) ---
const onSubmit = handleSubmit(async (values) => {
  Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));
  targetErrors.splice(0, targetErrors.length);
  let isDynamicPartValid = true;

  if (values.serviceMethod === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isDynamicPartValid = false;
  }
  if (values.serviceItemID?.includes(-1) && !otherserviceItem.value.trim()) {
    dynamicErrors.otherserviceItem = "請輸入其他需求";
    isDynamicPartValid = false;
  }
  selectedExtraItems.value.forEach((item) => {
    const input = extraInputValues[item.id];
    if (!input?.unit?.trim()) {
      dynamicErrors[`extraUnit_${item.id}`] = `${item.name} 單位為必填`;
      isDynamicPartValid = false;
    }
    if (!input?.content?.trim()) {
      dynamicErrors[`extraContent_${item.id}`] = `${item.name} 內容為必填`;
      isDynamicPartValid = false;
    }
  });

  values.targets?.forEach((target: Target, index: number) => {
    const currentErrors: Partial<Record<keyof Target, string>> = {};
    if (!target.name || !target.name.trim()) {
      currentErrors.name = "名稱為必填";
      isDynamicPartValid = false;
    }
    if (target.gender === null || target.gender === undefined) {
      currentErrors.gender = "性別為必填";
      isDynamicPartValid = false;
    }
    if (target.nationalityID === null || target.nationalityID === undefined) {
      currentErrors.nationalityID = "國籍為必填";
      isDynamicPartValid = false;
    }
    if (
      target.nationalityID === -1 &&
      (!target.nationalityOther || !target.nationalityOther.trim())
    ) {
      currentErrors.nationalityOther = "請輸入其他國籍";
      isDynamicPartValid = false;
    }
    targetErrors[index] = currentErrors;
  });

  if (!isDynamicPartValid || !meta.value.valid) {
    toast.add({
      severity: "warn",
      summary: "表單無效",
      detail: "請檢查所有必填欄位後再提交。",
      life: 3000,
    });
    return;
  }

  isSubmitting.value = true;

  const formattedDate = values.filingDate
    ? format(values.filingDate, "yyyy-MM-dd")
    : null;

  const extraInfoMap = new Map(
    selectedExtraItems.value.map((item) => [
      item.id,
      {
        id: item.id,
        unit: extraInputValues[item.id].unit.trim(),
        detail: extraInputValues[item.id].content.trim(),
      },
    ]),
  );

  const formattedServiceItems = (values.serviceItemID || [])
    .filter((id: number) => id !== -1)
    .map((id: number) => {
      if (extraInfoMap.has(id)) {
        return extraInfoMap.get(id);
      }
      return { id };
    });

  const formattedTargets = (values.targets || []).map((t: Target) => ({
    name: t.name.trim(),
    gender: t.gender,
    nationalityID: t.nationalityID,
    nationalityOther:
      t.nationalityID === -1 && t.nationalityOther
        ? t.nationalityOther.trim()
        : null,
  }));

  const payload = {
    filingDate: formattedDate,
    caseNumber: values.caseNumber?.trim(),
    targets: formattedTargets,
    serviceMethod: values.serviceMethod,
    serviceMethodOther:
      values.serviceMethod === -1 ? otherServicemethods.value.trim() : null,
    taskObject: values.taskObject?.trim() || null,
    detail: detail.value?.trim() || null,
    serviceItemID: formattedServiceItems,
    serviceItemOther: values.serviceItemID?.includes(-1)
      ? otherserviceItem.value.trim()
      : null,
  };

  try {
    await apiHandler.post(
      `/form/assign/arrival/${values.caseNumber}/record`,
      payload,
    );
    toast.add({
      severity: "success",
      summary: "提交成功",
      detail: "紀錄已成功新增！",
      life: 1500,
    });
    setTimeout(() => router.push("/"), 1500);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "提交失敗，請檢查網路或聯繫管理員。";
    toast.add({
      severity: "error",
      summary: "提交失敗",
      detail: errorMessage,
      life: 5000,
    });
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<style scoped>
/* 統一樣式 */
.p-field {
  margin-bottom: 1.5rem;
}
.p-error {
  display: block;
  margin-top: 0.25rem;
  color: var(--p-red-500);
  font-size: 0.875rem;
}
.text-red-500 {
  color: var(--p-red-500);
  margin-left: 0.25rem;
}
</style>
