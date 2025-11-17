<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">一般紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- 表單上半部分 (建檔日, 案號等) ... 此處無更動 ... -->
        <div class="field col-12 md:col-6">
          <label for="filingDate"
            >建檔日: <span class="text-red-500">*</span></label
          >
          <DatePicker
            inputId="filingDate"
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
            :readonly="isCaseLocked"
            :class="{ 'p-invalid': !!caseNumberError }"
          />
          <small class="p-error" v-if="caseNumberError">{{
            caseNumberError
          }}</small>
        </div>
        <div class="field col-12 md:col-6">
          <span id="serviceMethodsSelect-label"
            >服務方式: <span class="text-red-500">*</span></span
          >
          <Select
            aria-labelledby="serviceMethodsSelect-label"
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
            placeholder="工作目標"
            autoResize
          />
        </div>
        <div class="field col-12">
          <label for="detail">處遇摘要及評估:</label>
          <Textarea
            id="detail"
            v-model="detail"
            rows="5"
            class="w-full"
            placeholder="處遇摘要及評估"
            autoResize
          />
        </div>

        <!-- 對象陣列區域 -->
        <div class="col-12">
          <div class="flex justify-content-between align-items-center mb-2">
            <label class="font-bold"
              >對象: <span class="text-red-500">*</span></label
            >
            <div>
              <Button
                icon="pi pi-plus"
                class="p-button-success"
                @click="addTarget"
                type="button"
                v-tooltip.top="'新增對象'"
              />
            </div>
          </div>
          <small class="p-error mb-2" v-if="targetArrayError">{{
            targetArrayError
          }}</small>

          <Panel
            v-for="(field, idx) in targetFields"
            :key="field.key"
            :header="field.value.name?.trim() || `對象 ${idx + 1}`"
            toggleable
            class="mb-3"
          >
            <template #icons>
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-text p-button-rounded"
                type="button"
                @click.stop="removeTarget(idx)"
                v-tooltip.top="'移除此對象'"
              />
            </template>

            <!-- 對象表單內容 (基本資料部分無更動) -->
            <div class="grid formgrid">
              <div class="field col-12 md:col-4">
                <label :for="`target-name-${idx}`"
                  >名稱: <span class="text-red-500">*</span></label
                >
                <InputText
                  placeholder="請輸入對象名稱"
                  :id="`target-name-${idx}`"
                  v-model="field.value.name"
                  class="w-full"
                  :class="{ 'p-invalid': !!targetErrors[idx]?.name }"
                />
                <small class="p-error" v-if="targetErrors[idx]?.name">{{
                  targetErrors[idx]?.name
                }}</small>
              </div>
              <div class="field col-12 md:col-4">
                <label class="mb-2 block" :for="`male-${idx}`"
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
              <div class="field col-12 md:col-4">
                <span :id="`target-nationality-${idx}-label`"
                  >國籍: <span class="text-red-500">*</span></span
                >
                <Select
                  placeholder="請選擇對象國籍"
                  :aria-labelledby="`target-nationality-${idx}-label`"
                  v-model="field.value.nationalityID"
                  :options="nationalityList"
                  optionLabel="name"
                  optionValue="id"
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

            <!-- 服務項目區塊 -->
            <div
              class="p-2 mt-3 border-1 border-dashed surface-border border-round"
            >
              <h5 class="mt-0 mb-3">服務項目</h5>

              <div class="field col-12">
                <label
                  :for="
                    serviceObjectList.length
                      ? `serviceItem-${idx}-${serviceObjectList[0].id}`
                      : undefined
                  "
                >
                  服務項目: <span class="text-red-500">*</span>
                </label>
                <div
                  class="grid mt-2"
                  :class="{
                    'border-2 border-red-500 border-round p-1':
                      !!targetErrors[idx]?.serviceItemID,
                  }"
                >
                  <div
                    v-for="item in serviceObjectList"
                    :key="item.id"
                    class="col-12 md:col-4 lg:col-3 p-1"
                  >
                    <div class="flex align-items-center">
                      <Checkbox
                        :inputId="`serviceItem-${idx}-${item.id}`"
                        name="serviceItems"
                        :value="item.id"
                        v-model="field.value.serviceItemID"
                      />
                      <label
                        :for="`serviceItem-${idx}-${item.id}`"
                        class="ml-2"
                        >{{ item.name }}</label
                      >
                    </div>
                  </div>
                </div>
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.serviceItemID"
                  >{{ targetErrors[idx]?.serviceItemID }}</small
                >
              </div>

              <!-- ★★★ 服務項目額外輸入欄位 (已修改為動態陣列) ★★★ -->
              <div class="col-12 mt-3">
                <div class="grid formgrid -m-2">
                  <div
                    v-for="extra in getSelectedExtraItems(
                      field.value.serviceItemID,
                    )"
                    :key="extra.id"
                    class="col-12 lg:col-6 p-2"
                  >
                    <div
                      class="p-3 border-1 surface-border border-round h-full flex flex-column"
                    >
                      <div
                        class="flex justify-content-between align-items-center mb-3"
                      >
                        <h4 class="m-0">{{ extra.name }}</h4>
                        <Button
                          icon="pi pi-plus"
                          class="p-button-success p-button-sm p-button-rounded"
                          type="button"
                          @click="addExtraInput(idx, extra.id)"
                          v-tooltip.top="'新增一筆'"
                        />
                      </div>

                      <div
                        v-for="(input, inputIdx) in field.value
                          .extraInputValues[extra.id]"
                        :key="input.key"
                        class="mb-3 p-2 border-1 surface-border border-round-sm"
                      >
                        <div class="flex justify-content-end mb-2">
                          <Button
                            icon="pi pi-minus"
                            class="p-button-danger p-button-sm p-button-rounded p-button-text"
                            type="button"
                            @click="removeExtraInput(idx, extra.id, inputIdx)"
                          />
                        </div>
                        <div class="field">
                          <label :for="`unit-${idx}-${extra.id}-${inputIdx}`"
                            >單位: <span class="text-red-500">*</span></label
                          >
                          <InputText
                            :id="`unit-${idx}-${extra.id}-${inputIdx}`"
                            v-model="input.unit"
                            class="w-full"
                            :class="{
                              'p-invalid':
                                !!targetErrors[idx]?.[
                                  `extraUnit_${extra.id}_${inputIdx}`
                                ],
                            }"
                          />
                          <small
                            class="p-error"
                            v-if="
                              targetErrors[idx]?.[
                                `extraUnit_${extra.id}_${inputIdx}`
                              ]
                            "
                            >{{
                              targetErrors[idx]?.[
                                `extraUnit_${extra.id}_${inputIdx}`
                              ]
                            }}</small
                          >
                        </div>
                        <div class="field">
                          <label :for="`content-${idx}-${extra.id}-${inputIdx}`"
                            >內容: <span class="text-red-500">*</span></label
                          >
                          <Textarea
                            :id="`content-${idx}-${extra.id}-${inputIdx}`"
                            v-model="input.content"
                            rows="3"
                            autoResize
                            class="w-full"
                            :class="{
                              'p-invalid':
                                !!targetErrors[idx]?.[
                                  `extraContent_${extra.id}_${inputIdx}`
                                ],
                            }"
                          />
                          <small
                            class="p-error"
                            v-if="
                              targetErrors[idx]?.[
                                `extraContent_${extra.id}_${inputIdx}`
                              ]
                            "
                            >{{
                              targetErrors[idx]?.[
                                `extraContent_${extra.id}_${inputIdx}`
                              ]
                            }}</small
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 其他服務項目 -->
              <div
                class="field col-12"
                v-if="isOtherItemSelected(field.value.serviceItemID)"
              >
                <label :for="`otherserviceItem-${idx}`"
                  >請輸入其他需求：<span class="text-red-500">*</span></label
                >
                <Textarea
                  :id="`otherserviceItem-${idx}`"
                  v-model="field.value.serviceItemOther"
                  class="w-full"
                  :class="{
                    'p-invalid': !!targetErrors[idx]?.serviceItemOther,
                  }"
                  rows="3"
                  autoResize
                />
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.serviceItemOther"
                  >{{ targetErrors[idx]?.serviceItemOther }}</small
                >
              </div>
            </div>
          </Panel>
        </div>

        <div class="field col-12 flex justify-content-end">
          <Button
            type="submit"
            label="提交"
            icon="pi pi-check"
            :loading="isSubmitting"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, computed } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useToast } from "primevue/usetoast";
import { useRouter, useRoute } from "vue-router";
// --- PrimeVue Components ---
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
import Panel from "primevue/panel";
// --- VeeValidate ---
import { useForm, useField, useFieldArray, defineRule } from "vee-validate";

defineRule("required", (value: any) => {
  if (!value && value !== 0) {
    return "此欄位為必填";
  }
  return true;
});

// --- ★★★ 1. 更新類型定義 ★★★ ---
interface SelectOption {
  id: number;
  name: string;
}
interface ServiceObjectOption extends SelectOption {
  extra?: boolean;
}
interface ExtraInput {
  key: number; // 用於 v-for 的唯一 key
  unit: string;
  content: string;
}
interface Target {
  name: string;
  gender: number | null;
  nationalityID: number | null;
  nationalityOther: string;
  serviceItemID: number[];
  serviceItemOther: string;
  extraInputValues: Record<number, ExtraInput[]>; // 陣列!
}
type TargetError = Partial<
  Record<
    | keyof Omit<Target, "extraInputValues">
    | `extraUnit_${number}_${number}`
    | `extraContent_${number}_${number}`,
    string
  >
>;

// --- Hooks ---
const toast = useToast();
const router = useRouter();
const route = useRoute();
const props = defineProps<{ caseNumberQuery?: string }>();
const caseFromQuery = computed<string>(() => {
  const q = (route.query.caseNumber ??
    route.query.case ??
    props.caseNumberQuery) as string | string[] | undefined;
  return Array.isArray(q) ? (q[0] ?? "") : (q ?? "");
});
const isCaseLocked = computed<boolean>(() => !!caseFromQuery.value);

// --- Form State ---
const { handleSubmit, meta } = useForm({});
const isSubmitting = ref(false);

const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const {
  value: caseNumber,
  errorMessage: caseNumberError,
  resetField,
} = useField<string>("caseNumber", "required", {
  initialValue: caseFromQuery.value || "",
});
const { fields: targetFields, push, remove } = useFieldArray<Target>("targets");
const { errorMessage: targetArrayError } = useField<Target[]>(
  "targets",
  (value) => (value && value.length > 0 ? true : "請至少新增一個對象"),
  { initialValue: [] },
);
const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("serviceMethodID", "required"); // API 格式通常是 ID
const { value: taskObject } = useField<string>("taskObject");
const { value: detail } = useField<string>("detail");

// --- Manually Handled Fields ---
const otherServicemethods = ref("");
const dynamicErrors = reactive<Record<string, string | null>>({});
const targetErrors = reactive<Array<TargetError>>([]);

// --- API Data ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- Functions ---
const getSelectedExtraItems = (selectedIds: number[] | undefined) => {
  if (!selectedIds) return [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
};
const isOtherItemSelected = (selectedIds: number[] | undefined) => {
  return selectedIds?.includes(-1) ?? false;
};
const addTarget = () => {
  push({
    name: "",
    gender: null,
    nationalityID: null,
    nationalityOther: "",
    serviceItemID: [],
    serviceItemOther: "",
    extraInputValues: {},
  });
  targetErrors.push({});
};
const removeTarget = (index: number) => {
  remove(index);
  targetErrors.splice(index, 1);
};

// --- ★★★ 2. 新增 ExtraInput 的操作函式 ★★★ ---
const addExtraInput = (targetIndex: number, serviceItemId: number) => {
  const target = targetFields.value[targetIndex].value;
  if (!target.extraInputValues[serviceItemId]) {
    target.extraInputValues[serviceItemId] = [];
  }
  target.extraInputValues[serviceItemId].push({
    key: Date.now(),
    unit: "",
    content: "",
  });
};
const removeExtraInput = (
  targetIndex: number,
  serviceItemId: number,
  inputIndex: number,
) => {
  const target = targetFields.value[targetIndex].value;
  if (target.extraInputValues[serviceItemId]?.length > 1) {
    target.extraInputValues[serviceItemId].splice(inputIndex, 1);
  } else {
    toast.add({
      severity: "info",
      summary: "無法移除",
      detail: "每個項目至少需要保留一筆資料。",
      life: 2000,
    });
  }
};

// --- Watchers ---
watch(
  caseFromQuery,
  (newCaseValue) => {
    resetField({ value: newCaseValue || "" });
  },
  { immediate: false },
);
// --- ★★★ 3. 更新 Watcher 邏輯 ★★★ ---
watch(
  targetFields,
  (targets) => {
    targets.forEach((target) => {
      const selectedIds = new Set(target.value.serviceItemID);
      serviceObjectList.value.forEach((item) => {
        if (item.extra) {
          if (
            selectedIds.has(item.id) &&
            !target.value.extraInputValues[item.id]
          ) {
            target.value.extraInputValues[item.id] = [
              { key: Date.now(), unit: "", content: "" },
            ];
          } else if (
            !selectedIds.has(item.id) &&
            target.value.extraInputValues[item.id]
          ) {
            delete target.value.extraInputValues[item.id];
          }
        }
      });
    });
  },
  { deep: true },
);

// --- onMounted Hook ---
onMounted(async () => {
  try {
    const [natRes, metRes, sobjRes] = await Promise.all([
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      // 確保這裡的 type=1 是正確的
      apiHandler.get("/option/serviceItems?type=1"),
    ]);
    nationalityList.value = natRes.data.data ?? [];
    serviceMethodsList.value = metRes.data.data ?? [];
    serviceObjectList.value = sobjRes.data.data ?? [];
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "資料載入失敗",
      detail: "無法載入表單選項。",
      life: 3000,
    });
  }
});

// --- ★★★ 4. 更新 onSubmit 驗證和提交邏輯 ★★★ ---
const onSubmit = handleSubmit(async (values) => {
  Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));
  targetErrors.splice(
    0,
    targetErrors.length,
    ...Array(targetFields.value.length).fill({}),
  );

  let isFormValid = true;

  if (values.serviceMethodID === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isFormValid = false;
  }

  values.targets?.forEach((target: Target, index: number) => {
    const currentErrors: TargetError = {};
    let isTargetValid = true;

    // 基本資料驗證
    if (!target.name?.trim()) {
      currentErrors.name = "名稱為必填";
      isTargetValid = false;
    }
    if (target.gender === null) {
      currentErrors.gender = "性別為必填";
      isTargetValid = false;
    }
    if (target.nationalityID === null) {
      currentErrors.nationalityID = "國籍為必填";
      isTargetValid = false;
    }
    if (target.nationalityID === -1 && !target.nationalityOther?.trim()) {
      currentErrors.nationalityOther = "請輸入其他國籍";
      isTargetValid = false;
    }

    // 服務項目驗證
    if (!target.serviceItemID || target.serviceItemID.length === 0) {
      currentErrors.serviceItemID = "請選擇至少一個服務項目";
      isTargetValid = false;
    }
    if (
      target.serviceItemID?.includes(-1) &&
      !target.serviceItemOther?.trim()
    ) {
      currentErrors.serviceItemOther = "請輸入其他需求";
      isTargetValid = false;
    }

    // 額外項目驗證
    getSelectedExtraItems(target.serviceItemID).forEach((item) => {
      const inputs = target.extraInputValues[item.id] || [];
      if (inputs.length === 0) {
        currentErrors[`extraUnit_${item.id}_0`] =
          `${item.name} 至少需要一筆資料`;
        isTargetValid = false;
      }
      inputs.forEach((input, inputIdx) => {
        if (!input.unit?.trim()) {
          currentErrors[`extraUnit_${item.id}_${inputIdx}`] = `${
            item.name
          } #${inputIdx + 1} 單位為必填`;
          isTargetValid = false;
        }
        if (!input.content?.trim()) {
          currentErrors[`extraContent_${item.id}_${inputIdx}`] = `${
            item.name
          } #${inputIdx + 1} 內容為必填`;
          isTargetValid = false;
        }
      });
    });

    if (!isTargetValid) {
      isFormValid = false;
    }
    targetErrors[index] = currentErrors;
  });

  if (!isFormValid || !meta.value.valid) {
    toast.add({
      severity: "warn",
      summary: "表單無效",
      detail: "請檢查所有必填欄位。",
      life: 3000,
    });
    return;
  }

  isSubmitting.value = true;

  // 格式化提交的 payload
  const formattedTargets = (values.targets || []).map((t: Target) => {
    const formattedServiceItems = (t.serviceItemID || [])
      .filter((id) => id !== -1)
      .map((id) => {
        const hasExtraFlag = serviceObjectList.value.some(
          (s) => s.id === id && s.extra,
        );
        if (hasExtraFlag && t.extraInputValues[id]?.length > 0) {
          return {
            id: id,
            extras: t.extraInputValues[id].map((input) => ({
              unit: input.unit.trim(),
              detail: input.content.trim(),
            })),
          };
        } else {
          return { id: id, extras: null };
        }
      });

    return {
      name: t.name.trim(),
      gender: t.gender,
      nationalityID: t.nationalityID,
      nationalityOther:
        t.nationalityID === -1 ? t.nationalityOther.trim() : null,
      serviceItems: formattedServiceItems,
      serviceItemOther: t.serviceItemID?.includes(-1)
        ? t.serviceItemOther.trim()
        : null,
    };
  });

  const payload = {
    filingDate: format(values.filingDate!, "yyyy-MM-dd"),
    caseNumber: values.caseNumber?.trim(),
    serviceMethodID: values.serviceMethodID,
    serviceMethodOther:
      values.serviceMethodID === -1 ? otherServicemethods.value.trim() : "",
    taskObject: values.taskObject?.trim() || null,
    detail: values.detail?.trim() || null,
    targets: formattedTargets,
  };

  try {
    await apiHandler.post(
      `/form/assign/general/${values.caseNumber}/record`,
      payload,
    );
    toast.add({
      severity: "success",
      summary: "提交成功",
      detail: "紀錄已成功新增！",
      life: 1500,
    });
    setTimeout(() => {
      const backCaseNumberQuery = route.query.caseNumber;
      // 這裡的路由跳轉邏輯可能需要根據實際情況調整
      if (backCaseNumberQuery) {
        const backCaseNumber = Array.isArray(backCaseNumberQuery)
          ? backCaseNumberQuery[0]
          : backCaseNumberQuery;
        router.push({
          name: "AssignDetail",
          params: {
            type: "general", // 確保跳轉類型是 general
            caseNumber: backCaseNumber,
          },
        });
      } else {
        router.push("/");
      }
    }, 1500);
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      "提交失敗，請檢查網路或聯繫管理員。";
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
.p-error {
  color: #ef4444;
}
</style>
