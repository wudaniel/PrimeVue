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
          <DatePicker
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

        <!-- ★★★ 全域服務方式和工作目標 ★★★ -->
        <div class="field col-12 md:col-6">
          <label for="serviceMethodsSelect"
            >服務方式: <span class="text-red-500">*</span></label
          >
          <Select
            inputId="serviceMethodsSelect"
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

        <!-- ★★★ 對象陣列區域 ★★★ -->
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

          <div
            v-for="(field, idx) in targetFields"
            :key="field.key"
            class="p-3 border-1 surface-border border-round mb-3"
          >
            <!-- 對象標題和刪除按鈕 -->
            <div class="flex justify-content-between align-items-center mb-3">
              <h4 class="mt-0 mb-0 text-primary">對象 {{ idx + 1 }}</h4>
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-sm"
                type="button"
                @click="removeTarget(idx)"
                v-tooltip.top="'移除此對象'"
              />
            </div>

            <!-- 對象基本資料 -->
            <div class="grid formgrid">
              <div class="field col-12 md:col-4">
                <label :for="`target-name-${idx}`"
                  >名稱: <span class="text-red-500">*</span></label
                >
                <InputText
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
              <div class="field col-12 md:col-4">
                <label :for="`target-nationality-${idx}`"
                  >國籍: <span class="text-red-500">*</span></label
                >
                <Select
                  :inputId="`target-nationality-${idx}`"
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

            <!-- ★★★ 修改點 1: 服務項目區塊被移動到這裡，現在是每個對象的一部分 ★★★ -->
            <div
              class="p-2 mt-3 border-1 border-dashed surface-border border-round"
            >
              <h5 class="mt-0 mb-3">對象 {{ idx + 1 }} 的服務項目</h5>

              <div class="field col-12">
                <label>服務項目: <span class="text-red-500">*</span></label>
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
                      <!-- 注意 v-model 和 id 的變化 -->
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

              <!-- 服務項目的額外輸入欄位 -->
              <div class="col-12">
                <div class="grid formgrid">
                  <div
                    v-for="extra in getSelectedExtraItems(
                      field.value.serviceItemID,
                    )"
                    :key="extra.id"
                    class="col-12 md:col-6"
                  >
                    <div
                      class="p-3 border-1 surface-border border-round h-full"
                    >
                      <h4 class="mt-0 mb-3">{{ extra.name }}</h4>
                      <div class="field">
                        <label :for="`unit-${idx}-${extra.id}`"
                          >單位: <span class="text-red-500">*</span></label
                        >
                        <InputText
                          :id="`unit-${idx}-${extra.id}`"
                          v-model="field.value.extraInputValues[extra.id].unit"
                          class="w-full"
                          :class="{
                            'p-invalid':
                              !!targetErrors[idx]?.[`extraUnit_${extra.id}`],
                          }"
                        />
                        <small
                          class="p-error"
                          v-if="targetErrors[idx]?.[`extraUnit_${extra.id}`]"
                          >{{
                            targetErrors[idx]?.[`extraUnit_${extra.id}`]
                          }}</small
                        >
                      </div>
                      <div class="field">
                        <label :for="`content-${idx}-${extra.id}`"
                          >內容: <span class="text-red-500">*</span></label
                        >
                        <Textarea
                          :id="`content-${idx}-${extra.id}`"
                          v-model="
                            field.value.extraInputValues[extra.id].content
                          "
                          rows="3"
                          autoResize
                          class="w-full"
                          :class="{
                            'p-invalid':
                              !!targetErrors[idx]?.[`extraContent_${extra.id}`],
                          }"
                        />
                        <small
                          class="p-error"
                          v-if="targetErrors[idx]?.[`extraContent_${extra.id}`]"
                          >{{
                            targetErrors[idx]?.[`extraContent_${extra.id}`]
                          }}</small
                        >
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
          </div>
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
import { ref, onMounted, reactive, watch } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
// --- PrimeVue Components ---
import { DatePicker } from "primevue";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Select from "primevue/select";
("primevue/select");
import Textarea from "primevue/textarea";
import Checkbox from "primevue/checkbox";
// --- VeeValidate ---
import { useForm, useField, useFieldArray, defineRule } from "vee-validate";

defineRule("required", (value: any) => {
  if (!value && value !== 0) {
    return "此欄位為必填";
  }
  return true;
});

// --- ★★★ 修改點 2: 更新類型定義 ★★★ ---
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

// Target 介面現在包含服務項目相關的欄位
interface Target {
  name: string;
  gender: number | null;
  nationalityID: number | null;
  nationalityOther: string;
  serviceItemID: number[];
  serviceItemOther: string;
  extraInputValues: Record<number, ExtraInput>;
}
// 針對 targetErrors 的類型
type TargetError = Partial<
  Record<
    | keyof Omit<Target, "extraInputValues">
    | `extraUnit_${number}`
    | `extraContent_${number}`,
    string
  >
>;

// --- Hooks ---
const toast = useToast();
const router = useRouter();
const props = defineProps<{ caseNumberQuery?: string }>();

// --- Form State ---
const { handleSubmit, meta } = useForm({});
const isSubmitting = ref(false);

const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
  { initialValue: props.caseNumberQuery || "" },
);

// useFieldArray 現在管理更複雜的 Target 物件
const { fields: targetFields, push, remove } = useFieldArray<Target>("targets");
const { errorMessage: targetArrayError } = useField<Target[]>(
  "targets",
  (value) => (value && value.length > 0 ? true : "請至少新增一個對象"),
  { initialValue: [] },
);

// 全域欄位
const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("serviceMethod", "required");
const { value: taskObject } = useField<string>("taskObject");
const { value: detail } = useField<string>("detail");

// --- Manually Handled Fields ---
const otherServicemethods = ref("");
const dynamicErrors = reactive<Record<string, string | null>>({});
const targetErrors = reactive<Array<TargetError>>([]); // 使用新的錯誤類型

// --- API Data ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- ★★★ 修改點 3: 將 Computed 改為函式 ★★★ ---
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
  // 當新增 Target 時，也為其新增服務項目相關的初始空值
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

// --- Watcher ---
// 這個 watcher 現在需要遍歷所有 targetFields
watch(
  targetFields,
  (targets) => {
    targets.forEach((target) => {
      const selectedIds = new Set(target.value.serviceItemID);
      // 初始化 extra input
      getSelectedExtraItems(target.value.serviceItemID).forEach((item) => {
        if (!target.value.extraInputValues[item.id]) {
          target.value.extraInputValues[item.id] = { unit: "", content: "" };
        }
      });
      // 清理不再需要的 extra input
      Object.keys(target.value.extraInputValues).forEach((idStr) => {
        const id = parseInt(idStr, 10);
        if (!selectedIds.has(id)) {
          delete target.value.extraInputValues[id];
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
      apiHandler.get("/option/serviceItems?type=2"),
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

// --- ★★★ 修改點 4: 更新 onSubmit 驗證和提交邏輯 ★★★ ---
const onSubmit = handleSubmit(async (values) => {
  Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));
  targetErrors.splice(
    0,
    targetErrors.length,
    ...Array(targetFields.value.length).fill({}),
  );

  let isFormValid = true;

  // 驗證全域欄位
  if (values.serviceMethod === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isFormValid = false;
  }

  // 遍歷並驗證每個對象
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
      const input = target.extraInputValues[item.id];
      if (!input?.unit?.trim()) {
        currentErrors[`extraUnit_${item.id}`] = `${item.name} 單位為必填`;
        isTargetValid = false;
      }
      if (!input?.content?.trim()) {
        currentErrors[`extraContent_${item.id}`] = `${item.name} 內容為必填`;
        isTargetValid = false;
      }
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
    // 為當前 target 格式化 service items
    const extraInfoMap = new Map(
      getSelectedExtraItems(t.serviceItemID).map((item) => [
        item.id,
        {
          id: item.id,
          unit: t.extraInputValues[item.id].unit.trim(),
          detail: t.extraInputValues[item.id].content.trim(),
        },
      ]),
    );
    const formattedServiceItems = (t.serviceItemID || [])
      .filter((id) => id !== -1)
      .map((id) => (extraInfoMap.has(id) ? extraInfoMap.get(id) : { id }));

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
    serviceMethod: values.serviceMethod,
    serviceMethodOther:
      values.serviceMethod === -1 ? otherServicemethods.value.trim() : null,
    taskObject: values.taskObject?.trim() || null,
    detail: values.detail?.trim() || null,
    targets: formattedTargets, // 提交格式化後的對象陣列
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
/* 樣式保持不變 */
</style>
