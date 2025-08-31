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
          <label for="taskObject">關於該案的工作目標:</label>
          <Textarea
            id="taskObject"
            v-model="taskObject"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': !!taskObjectError }"
            placeholder="關於該案的工作目標"
            autoResize
          />
          <small class="p-error" v-if="taskObjectError">{{
            taskObjectError
          }}</small>
        </div>

        <div class="field col-12">
          <label for="detail">關於該案的服務目標:</label>
          <Textarea
            id="detail"
            v-model="detail"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': !!detailError }"
            placeholder="關於該案的服務目標"
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
import { ref, onMounted, computed, watch, reactive } from "vue"; // 移除 nextTick (如果不用動態註冊)
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
// --- PrimeVue Components ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber"; // 移除了，原表單沒有年份輸入
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import MultiSelect from "primevue/multiselect";
// --- VeeValidate (for static fields only) ---
import { useForm, useField } from "vee-validate";

// --- Type Definitions ---
interface SelectOption {
  id: number;
  name: string;
  sourceCatID?: number;
}
interface ServiceObjectOption extends SelectOption {
  extra?: boolean;
}
interface ExtraInput {
  unit: string;
  content: string;
}

// --- VeeValidate Setup (Static Fields) ---
const { handleSubmit, errors, meta, values } = useForm({});
// 在你的新增記錄表單元件 (例如 Arrivalassigns.vue) 的 <script setup lang="ts"> 中
const props = defineProps<{
  caseNumberQuery?: string; // 接收名為 caseNumberQuery 的 prop
}>();

const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber", // VeeValidate 內部欄位名
  "required",
  {
    initialValue: props.caseNumberQuery || "", // 使用 prop 的值作為初始值
  },
);

// --- Refs for Static Fields (managed by VeeValidate) ---
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");

const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("nationality", "required");
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
  useField<number[] | undefined>(
    "serviceObjectID",
    (value) => {
      if (!value || value.length === 0) {
        return "請選擇至少一個服務項目";
      }
      return true;
    },
    { initialValue: [] },
  );

// --- Refs for Manually Handled Fields ---
const othernationalities = ref("");
const otherServicemethods = ref("");
const otherServiceobject = ref("");

// --- API Option Lists ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- Dynamic Extra Fields Data ---
const extraInputValues = reactive<Record<number, ExtraInput>>({});
// --- Manual Errors for Dynamic Fields ---
const dynamicErrors = reactive<Record<string, string | null>>({});

// --- Original Error Flag (kept for compatibility if needed) ---
const objectRequiredError = ref(false);

// --- Computed Properties ---
const selectedExtraItems = computed(() => {
  const selectedIds = selectedServiceobject.value ?? [];
  const list = serviceObjectList.value ?? [];
  if (!Array.isArray(selectedIds) || !Array.isArray(list)) return [];
  return list.filter(
    (item) =>
      item &&
      item.extra &&
      typeof item.id === "number" &&
      selectedIds.includes(item.id),
  );
});

const isServiceObjectOtherSelected = computed(
  () => selectedServiceobject.value?.includes(-1) ?? false,
);

// Computed property to check overall form validity (static + dynamic)
const isFormPotentiallyValid = computed(() => {
  // Check if any dynamic error exists
  const hasManualErrors = Object.values(dynamicErrors).some(
    (error) => error !== null,
  );
  // Return true only if VeeValidate state is valid AND no manual errors exist
  return meta.value.valid && !hasManualErrors;
});

// --- Watcher (Simplified: only manages extraInputValues data) ---
watch(
  selectedExtraItems,
  (newItems, oldItems) => {
    if (!Array.isArray(newItems)) return;
    oldItems = oldItems ?? [];
    const currentExtraIds = new Set(newItems.map((item) => item.id));

    // Initialize new items
    newItems.forEach((item) => {
      if (item && typeof item.id === "number" && !extraInputValues[item.id]) {
        extraInputValues[item.id] = { unit: "", content: "" };
      }
    });
    // Clean up removed items and their errors
    const oldIds = oldItems.map((item) => item.id);
    oldIds.forEach((id) => {
      if (typeof id === "number" && !currentExtraIds.has(id)) {
        delete extraInputValues[id];
        delete dynamicErrors[`extraUnit_${id}`];
        delete dynamicErrors[`extraContent_${id}`];
      }
    });
  },
  { deep: true, flush: "post" },
);

// --- onMounted ---
onMounted(async () => {
  try {
    const [natRes, metRes, sobjRes] = await Promise.all([
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      apiHandler.get("/option/serviceObjects"), // Original uses type: 1 or 2? Fetch all for now
    ]);
    nationalityList.value = natRes.data.data ?? [];
    serviceMethodsList.value = metRes.data.data ?? [];
    serviceObjectList.value = sobjRes.data.data ?? [];
    console.log("Options fetched.");
  } catch (error) {
    console.error("Failed to fetch options:", error);
  }
});

// --- Submit Handler (with manual validation) ---
const onSubmit = handleSubmit(
  async (values) => {
    // values only contains static fields now
    // 1. Manual Validation
    let isFormValid = true;
    Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null)); // Reset dynamic errors
    objectRequiredError.value = false; // Reset original error flag

    // Validate othernationalities
    if (values.nationality === -1 && !othernationalities.value?.trim()) {
      dynamicErrors.othernationalities = "請輸入其他國籍";
      isFormValid = false;
    }
    // Validate otherServicemethods
    if (values.serviceMethod === -1 && !otherServicemethods.value?.trim()) {
      dynamicErrors.otherServicemethods = "請輸入其他服務方式";
      isFormValid = false;
    }
    // Validate otherServiceobject
    if (
      values.serviceObjectID?.includes(-1) &&
      !otherServiceobject.value?.trim()
    ) {
      dynamicErrors.otherServiceobject = "請輸入其他需求";
      isFormValid = false;
    }
    // Validate dynamic extra fields
    for (const extraItem of selectedExtraItems.value) {
      const itemId = extraItem.id;
      const unitFieldName = `extraUnit_${itemId}`;
      const contentFieldName = `extraContent_${itemId}`;
      if (!extraInputValues[itemId]) {
        // Safety check
        dynamicErrors[unitFieldName] = "數據錯誤";
        dynamicErrors[contentFieldName] = "數據錯誤";
        isFormValid = false;
        continue;
      }
      if (!extraInputValues[itemId].unit?.trim()) {
        dynamicErrors[unitFieldName] = `${extraItem.name} 單位為必填`;
        isFormValid = false;
      }
      if (!extraInputValues[itemId].content?.trim()) {
        dynamicErrors[contentFieldName] = `${extraItem.name} 內容為必填`;
        isFormValid = false;
      }
    }
    // Check original service object required error (if still needed alongside VeeValidate)
    if (!values.serviceObjectID || values.serviceObjectID.length === 0) {
      objectRequiredError.value = true; // Set original flag if needed
      // VeeValidate error (`serviceObjectError`) should also trigger
    }

    // 2. Check overall validity
    if (!isFormValid || !meta.value.valid) {
      // Check both manual and VeeValidate state
      console.error("表單驗證失敗", {
        staticErrors: errors.value,
        dynamicErrors,
      });
      alert("表單包含錯誤，請檢查後再提交！");
      return;
    }

    // 3. All Validations Passed - Proceed
    console.log("表單驗證通過");

    // 4. Format Date
    let formattedDate = null;
    if (
      values.filingDate instanceof Date &&
      !isNaN(values.filingDate.getTime())
    ) {
      try {
        formattedDate = format(values.filingDate, "yyyy-MM-dd");
      } catch (e) {
        console.error(e);
      }
    }

    // 5. Build extraInfo
    const extraInfo = selectedExtraItems.value.map((extraItem) => ({
      id: extraItem.id,
      unit: extraInputValues[extraItem.id]?.unit?.trim() ?? "",
      detail: extraInputValues[extraItem.id]?.content?.trim() ?? "",
    }));

    // 6. Build Payload (Combine values and local refs for manual fields)
    const payload = {
      filingDate: formattedDate,
      caseNumber: values.caseNumber?.trim(),
      nationalityID: values.nationality,
      nationalityOther:
        values.nationality === -1 ? othernationalities.value?.trim() : null, // Use ref
      target: values.target?.trim(),
      gender: Number(values.gender),
      serviceMethod: values.serviceMethod,
      serviceMethodOther:
        values.serviceMethod === -1 ? otherServicemethods.value?.trim() : null, // Use ref
      taskObject: values.taskObject?.trim(), // Use value from VeeValidate
      detail: values.detail?.trim(), // Use value from VeeValidate
      serviceObjectID: values.serviceObjectID,
      serviceObjectOther: values.serviceObjectID?.includes(-1)
        ? otherServiceobject.value?.trim()
        : null, // Use ref
      extraInfo: extraInfo,
    };
    console.log("Submitting:", payload);

    // 7. API Call (to original endpoint)
    try {
      const response = await apiHandler.post(
        `/form/assign/arrival/FK/record`,
        payload,
      );
      console.log("提交成功:", response);
      alert("提交成功！");
    } catch (error) {
      console.error("提交失敗:", error);
      // Original code used alert, keeping it similar
      alert("提交失敗，請檢查欄位或稍後再試");
    }
  },
  (context) => {
    // VeeValidate static field validation failure
    console.log("靜態欄位驗證失敗", context.errors);
    // Optional: alert here too, or rely on the combined check
  },
);
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
