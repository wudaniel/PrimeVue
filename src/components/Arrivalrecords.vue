<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- ★★★ 修改點 1：調整網格寬度 ★★★ -->
        <div class="field col-12 md:col-6">
          <label for="filingDate"
            >建檔日:<span class="text-red-500">*</span></label
          >
          <Calendar
            id="filingDate"
            v-model="filingDate"
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="YYYY-MM-DD"
            class="w-full"
            :invalid="!!filingDateError"
          />
          <!-- ★★★ 修改點 2：確保文字顏色為紅色 ★★★ -->
          <small class="p-error text-red-500" v-if="filingDateError">{{
            filingDateError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="caseNumber"
            >案號:<span class="text-red-500">*</span></label
          >
          <InputText
            id="caseNumber"
            v-model="caseNumber"
            placeholder="案號"
            class="w-full"
            :class="{ 'p-invalid': !!caseNumberError }"
          />
          <small class="p-error text-red-500" v-if="caseNumberError">{{
            caseNumberError
          }}</small>
        </div>

        <!-- (為了保持一致性，我將所有的 p-error 都加上了 text-red-500) -->
        <div class="field col-12 md:col-6">
          <label for="nationalityDropdown"
            >原母國籍:<span class="text-red-500">*</span></label
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
          <small class="p-error text-red-500" v-if="nationalityError">{{
            nationalityError
          }}</small>
        </div>

        <div class="field col-12 md:col-6" v-if="selectednationalities === -1">
          <label for="othernationalities"
            >請輸入其他國籍:<span class="text-red-500">*</span></label
          >

          <Textarea
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': !!othernationalitiesError }"
            rows="1"
            autoResize
          />
          <small class="p-error text-red-500" v-if="othernationalitiesError">{{
            othernationalitiesError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="target"
            >對象名稱:<span class="text-red-500">*</span></label
          >
          <InputText
            id="target"
            v-model="target"
            placeholder="對象名稱"
            class="w-full"
            :class="{ 'p-invalid': !!targetError }"
          />
          <small class="p-error text-red-500" v-if="targetError">{{
            targetError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label class="mb-2 block"
            >性別:<span class="text-red-500">*</span></label
          >

          <RadioButton
            inputId="male"
            name="gender"
            :value="0"
            v-model="selectedGender"
          />
          <label for="male" class="ml-2">男</label>

          <RadioButton
            inputId="female"
            name="gender"
            :value="1"
            v-model="selectedGender"
          />
          <label for="female" class="ml-2">女</label>

          <RadioButton
            inputId="otherGenderRadio"
            name="gender"
            :value="2"
            v-model="selectedGender"
          />
          <label for="otherGenderRadio" class="ml-2">其他</label>

          <small class="p-error text-red-500 mt-1" v-if="genderError">{{
            genderError
          }}</small>
        </div>

        <!-- ... 其他欄位保持不變 ... -->

        <!-- (以下是其餘欄位的程式碼，我也幫您加上 text-red-500) -->

        <div class="field col-12 md:col-6">
          <label for="serviceMethodsDropdown"
            >服務方式:<span class="text-red-500">*</span></label
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
          <small class="p-error text-red-500" v-if="servicemethodsError">{{
            servicemethodsError
          }}</small>
        </div>

        <div class="field col-12 md:col-6" v-if="selectedServicemethods === -1">
          <label for="otherServicemethods">請輸入其他服務方式:</label>
          <Textarea
            id="otherServicemethods"
            v-model="otherServicemethods"
            class="w-full"
            :class="{ 'p-invalid': !!otherServicemethodsError }"
            rows="1"
            autoResize
          />
          <small class="p-error text-red-500" v-if="otherServicemethodsError">{{
            otherServicemethodsError
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
          <small class="p-error text-red-500" v-if="taskObjectError">{{
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
          <small class="p-error text-red-500" v-if="detailError">{{
            detailError
          }}</small>
        </div>

        <div class="field col-12">
          <label for="serviceObject"
            >服務項目:<span class="text-red-500">*</span></label
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
          <small class="p-error text-red-500" v-if="serviceObjectError">{{
            serviceObjectError
          }}</small>
        </div>

        <!-- ... 提交按鈕 ... -->
        <div class="field col-12 flex justify-content-end">
          <Button
            type="submit"
            label="提交"
            icon="pi pi-check"
            :disabled="!meta.valid && meta.touched"
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
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

// --- PrimeVue 元件 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
// import InputNumber from "primevue/inputnumber"; // 未使用，可移除
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import MultiSelect from "primevue/multiselect";
// --- VeeValidate ---
import { useForm, useField } from "vee-validate";

// ★★★ 初始化 Toast 和 Router ★★★
const toast = useToast();
const router = useRouter();

// --- 類型定義 ---
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

// --- VeeValidate 設定 ---
const { handleSubmit, errors, meta, values } = useForm({});
const props = defineProps<{ caseNumberQuery?: string }>();

// ★★★ 新增：提交狀態 ★★★
const isSubmitting = ref(false);

// ★★★ 重構後的欄位定義 (語法更簡潔) ★★★
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("建檔日", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "案號",
  "required",
  { initialValue: props.caseNumberQuery || "" },
);
const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("原母國籍", "required");
const { value: target, errorMessage: targetError } = useField<string>(
  "對象名稱",
  "required",
);
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("性別", "required");
const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("服務方式", "required");
const { value: taskObject, errorMessage: taskObjectError } =
  useField<string>("taskObject");
const { value: detail, errorMessage: detailError } = useField<string>("detail");
const { value: selectedServiceobject, errorMessage: serviceObjectError } =
  useField<number[]>(
    "serviceObjectID",
    (value) => (value && value.length > 0 ? true : "請選擇至少一個服務項目"),
    { initialValue: [] },
  );

// --- 手動管理的 Ref ---
const othernationalities = ref("");
const otherServicemethods = ref("");
const otherServiceobject = ref("");

// --- API 選項列表 ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- 動態欄位資料與錯誤 ---
const extraInputValues = reactive<Record<number, ExtraInput>>({});
const dynamicErrors = reactive<Record<string, string | null>>({});

// --- 計算屬性 ---
const selectedExtraItems = computed(() => {
  const selectedIds = selectedServiceobject.value ?? [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
});
const isServiceObjectOtherSelected = computed(
  () => selectedServiceobject.value?.includes(-1) ?? false,
);

const isFormValid = computed(() => {
  const hasDynamicErrors = Object.values(dynamicErrors).some(
    (error) => error !== null,
  );
  return meta.value.valid && !hasDynamicErrors;
});

// --- 動態欄位的 Watcher (無需變更) ---
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

// ★★★ 重構後的 onMounted Hook ★★★
onMounted(async () => {
  try {
    const [natRes, metRes, sobjRes] = await Promise.all([
      apiHandler.get("/option/nationalities"),
      apiHandler.get("/option/serviceMethods"),
      apiHandler.get("/option/serviceObjects"),
    ]);

    // ★★★ 核心修正：存取 API 回應中嵌套的 .data 屬性 ★★★
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

// ★★★ 重構後的提交處理函式 ★★★
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));
  let isDynamicPartValid = true;

  // 手動驗證
  if (values.nationality === -1 && !othernationalities.value.trim()) {
    dynamicErrors.othernationalities = "請輸入其他國籍";
    isDynamicPartValid = false;
  }
  if (values.serviceMethod === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isDynamicPartValid = false;
  }
  if (
    (values.serviceObjectID ?? []).includes(-1) &&
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

  if (!isDynamicPartValid || !meta.value.valid) {
    toast.add({
      severity: "warn",
      summary: "表單無效",
      detail: "請檢查所有必填欄位後再提交。",
      life: 3000,
    });
    isSubmitting.value = false;
    return;
  }

  // 建立 Payload
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
    nationalityID: values.nationality,
    nationalityOther:
      values.nationality === -1 ? othernationalities.value.trim() : null,
    target: values.target?.trim(),
    gender: values.gender,
    serviceMethod: values.serviceMethod,
    serviceMethodOther:
      values.serviceMethod === -1 ? otherServicemethods.value.trim() : null,
    taskObject: values.taskObject?.trim(),
    detail: values.detail?.trim(),
    serviceObjectID: values.serviceObjectID,
    serviceObjectOther: (values.serviceObjectID ?? []).includes(-1)
      ? otherServiceobject.value.trim()
      : null,
    extraInfo: extraInfo,
  };

  // API 呼叫
  try {
    // 如果您的端點不同，請替換這裡
    await apiHandler.post(`/form/assign/arrival/FK/record`, payload);
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
    isSubmitting.value = false;
  }
});
</script>

<style scoped>
#arrival-form-card .field {
  margin-bottom: 1rem;
}
.text-red-500 {
  color: var(--p-red-500);
  margin-left: 0.25rem;
}
</style>
