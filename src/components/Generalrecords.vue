<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">一般紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
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

        <div class="field col-12 md:col-6">
          <label for="nationalityDropdown"
            >原母國籍: <span class="text-red-500">*</span></label
          >
          <Dropdown
            inputId="nationalityDropdown"
            v-model="selectednationalities"
            :options="nationalityList"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇國籍"
            class="w-full"
            filter
            :class="{ 'p-invalid': !!nationalityError }"
          />
          <small class="p-error" v-if="nationalityError">{{
            nationalityError
          }}</small>
        </div>

        <div class="field col-12 md:col-6" v-if="selectednationalities === -1">
          <label for="othernationalities"
            >請輸入其他國籍: <span class="text-red-500">*</span></label
          >
          <Textarea
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': !!dynamicErrors.othernationalities }"
            rows="1"
            autoResize
          />
          <small class="p-error" v-if="dynamicErrors.othernationalities">{{
            dynamicErrors.othernationalities
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="target"
            >對象名稱: <span class="text-red-500">*</span></label
          >
          <InputText
            id="target"
            v-model="target"
            placeholder="對象名稱"
            class="w-full"
            :class="{ 'p-invalid': !!targetError }"
          />
          <small class="p-error" v-if="targetError">{{ targetError }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label class="mb-2 block"
            >性別: <span class="text-red-500">*</span></label
          >
          <div class="flex flex-wrap gap-3">
            <div class="flex align-items-center">
              <RadioButton
                inputId="male"
                name="gender"
                :value="0"
                v-model="selectedGender"
              />
              <label for="male" class="ml-2">男</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="female"
                name="gender"
                :value="1"
                v-model="selectedGender"
              />
              <label for="female" class="ml-2">女</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="otherGenderRadio"
                name="gender"
                :value="2"
                v-model="selectedGender"
              />
              <label for="otherGenderRadio" class="ml-2">其他</label>
            </div>
          </div>
          <small class="p-error mt-1" v-if="genderError">{{
            genderError
          }}</small>
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
          <label for="serviceObject"
            >服務項目: <span class="text-red-500">*</span></label
          >
          <MultiSelect
            inputId="serviceObject"
            v-model="selectedServiceobject"
            :options="serviceObjectList"
            optionLabel="name"
            optionValue="id"
            placeholder="服務項目 (可多選)"
            display="chip"
            class="w-full"
            :class="{ 'p-invalid': !!serviceObjectError }"
          />
          <small class="p-error" v-if="serviceObjectError">{{
            serviceObjectError
          }}</small>

          <div
            v-if="objectRequiredError"
            style="color: red; margin-top: 0.25rem"
          >
            請選擇至少一個服務項目。
          </div>
        </div>

        <div class="col-12">
          <div
            v-for="extra in selectedExtraItems"
            :key="extra.id"
            class="grid formgrid p-fluid mt-3 border-top-1 surface-border pt-3"
          >
            <template v-if="extraInputValues[extra.id]">
              <h4 class="col-12">{{ extra.name }}</h4>
              <div class="field col-12 md:col-6">
                <label :for="'unit-' + extra.id"
                  >{{ extra.name }} 單位:
                  <span class="text-red-500">*</span></label
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
                >
                  {{ dynamicErrors[`extraUnit_${extra.id}`] }}
                </small>
              </div>
              <div class="field col-12 md:col-6">
                <label :for="'content-' + extra.id"
                  >{{ extra.name }} 內容:
                  <span class="text-red-500">*</span></label
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
                >
                  {{ dynamicErrors[`extraContent_${extra.id}`] }}
                </small>
              </div>
            </template>
            <div v-else class="col-12"><small>Initializing...</small></div>
          </div>
        </div>

        <div class="field col-12" v-if="isServiceObjectOtherSelected">
          <label for="otherServiceobject"
            >請輸入其他需求：<span class="text-red-500">*</span></label
          >
          <Textarea
            id="otherServiceobject"
            v-model="otherServiceobject"
            class="w-full"
            :class="{ 'p-invalid': !!dynamicErrors.otherServiceobject }"
            rows="3"
            autoResize
          />
          <small class="p-error" v-if="dynamicErrors.otherServiceobject">{{
            dynamicErrors.otherServiceobject
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
import MultiSelect from "primevue/multiselect";
// --- VeeValidate ---
import { useForm, useField } from "vee-validate";

// --- Type Definitions ---
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

// --- Hooks ---
const toast = useToast();
const router = useRouter(); // 如果需要提交後跳轉

// --- Props ---
const props = defineProps<{
  caseNumberQuery?: string;
}>();

// --- Form State ---
const { handleSubmit, errors, meta } = useForm({});
const isSubmitting = ref(false);

// --- VeeValidate Field Definitions (keys match API payload) ---
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
  { initialValue: props.caseNumberQuery || "" },
);
const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("nationalityID", "required"); // ★★★ FIX: Key is nationalityID
const { value: target, errorMessage: targetError } = useField<string>(
  "target",
  "required",
);
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("serviceMethod", "required");
const { value: taskObject, errorMessage: taskObjectError } =
  useField<string>("taskObject"); // Not required
const { value: detail, errorMessage: detailError } = useField<string>("detail"); // Not required
const { value: selectedServiceobject, errorMessage: serviceObjectError } =
  useField<number[]>(
    "serviceObjectID",
    (value) => (value && value.length > 0 ? true : "請選擇至少一個服務項目"),
    { initialValue: [] },
  );

// --- Manually Handled Fields ---
const othernationalities = ref("");
const otherServicemethods = ref("");
const otherServiceobject = ref("");
const extraInputValues = reactive<Record<number, ExtraInput>>({});
const dynamicErrors = reactive<Record<string, string | null>>({});

// --- API Option Lists ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- Computed Properties ---
const selectedExtraItems = computed(() => {
  const selectedIds = selectedServiceobject.value ?? [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
});

const isServiceObjectOtherSelected = computed(
  () => selectedServiceobject.value?.includes(-1) ?? false,
);

const isFormPotentiallyValid = computed(() => {
  const hasDynamicErrors = Object.values(dynamicErrors).some(
    (error) => error !== null,
  );
  return meta.value.valid && !hasDynamicErrors;
});

// --- Watcher for Dynamic Fields ---
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

// --- onMounted Hook ---
onMounted(async () => {
  try {
    const [natRes, metRes, sobjRes] = await Promise.all([
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      apiHandler.get("/option/serviceObjects"),
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

// --- Submit Handler ---
const onSubmit = handleSubmit(async (values) => {
  // 1. Reset and run manual validation for dynamic fields
  Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));
  let isDynamicPartValid = true;

  if (values.nationalityID === -1 && !othernationalities.value.trim()) {
    dynamicErrors.othernationalities = "請輸入其他國籍";
    isDynamicPartValid = false;
  }
  if (values.serviceMethod === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isDynamicPartValid = false;
  }
  if (
    values.serviceObjectID?.includes(-1) &&
    !otherServiceobject.value.trim()
  ) {
    dynamicErrors.otherServiceobject = "請輸入其他需求";
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

  // 2. Check overall validity
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

  // 3. Build Payload
  const formattedDate = values.filingDate
    ? format(values.filingDate, "yyyy-MM-dd")
    : null;
  const extraInfo = selectedExtraItems.value.map((item) => ({
    id: item.id,
    unit: extraInputValues[item.id].unit.trim(),
    detail: extraInputValues[item.id].content.trim(),
  }));

  const payload = {
    filingDate: formattedDate,
    caseNumber: values.caseNumber?.trim(),
    nationalityID: values.nationalityID,
    nationalityOther:
      values.nationalityID === -1 ? othernationalities.value.trim() : null,
    target: values.target?.trim(),
    gender: values.gender,
    serviceMethod: values.serviceMethod,
    serviceMethodOther:
      values.serviceMethod === -1 ? otherServicemethods.value.trim() : null,
    taskObject: values.taskObject?.trim() || null,
    detail: values.detail?.trim() || null,
    serviceObjectID: values.serviceObjectID,
    serviceObjectOther: values.serviceObjectID?.includes(-1)
      ? otherServiceobject.value.trim()
      : null,
    extraInfo: extraInfo,
  };

  // 4. API Call
  try {
    await apiHandler.post(
      `/form/assign/general/record/${values.caseNumber}`,
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
/* Styles from original + PrimeFlex error style */
.p-field {
  margin-bottom: 1.5rem; /* Adjust as needed */
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
.extra-fields {
  border-left: 3px solid var(--p-primary-color);
  padding-left: 1rem;
  margin-left: 0.5rem;
  margin-top: 1rem;
}

/* Original Textarea Styles (if needed, adjust selectors) */
.input-set {
  display: inline-block;
}
.textarea-label {
  display: block;
  margin-bottom: 4px;
}
.textarea-container {
  position: relative;
  display: inline-block;
}
.auto-resizing-textarea {
  /* Style PrimeVue Textarea via :deep if needed */
}
.fixed-placeholder {
  /* May not be needed with PrimeVue Placeholder */
}
.MainWorker {
  color: black;
  background: field;
} /* Keep if styling needed */
</style>
