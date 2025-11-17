<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">一般派案表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <div class="field col-12 md:col-6">
          <label for="filingDate">填表日期:</label>
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
          <label for="caseNumber">案號:</label>
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
          <label for="fullName">全名:</label>
          <InputText
            id="fullName"
            v-model="FullName"
            placeholder="請輸入案主姓名"
            class="w-full"
            :class="{ 'p-invalid': !!FullNameError }"
          />
          <small class="p-error" v-if="FullNameError">{{
            FullNameError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <span id="nationalitySelect-label">原母國籍</span>
          <Select
            aria-labelledby="nationalitySelect-label"
            v-model="selectednationalities"
            :options="Nationality_List"
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
          <label for="othernationalities">請輸入其他國籍:</label>

          <InputText
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': !!othernationalitiesError }"
            autoResize
            rows="1"
          />
          <small class="p-error" v-if="othernationalitiesError">{{
            othernationalitiesError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="yearInput">出生年份:</label>
          <InputNumber
            inputId="yearInput"
            v-model="selectedYear"
            mode="decimal"
            :useGrouping="false"
            placeholder="請輸入年份 (YYYY)"
            class="w-full"
            :class="{ 'p-invalid': !!selectedYearError }"
          />
          <small class="p-error" v-if="selectedYearError">{{
            selectedYearError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label class="mb-2 block" for="gender0">性別:</label>
          <div class="flex flex-wrap gap-3">
            <div class="flex align-items-center">
              <RadioButton
                inputId="gender0"
                name="gender"
                :value="0"
                v-model="selectedGender"
                :class="{ 'p-invalid': !!genderError }"
              />
              <label for="gender0" class="ml-2">男</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="gender1"
                name="gender"
                :value="1"
                v-model="selectedGender"
                :class="{ 'p-invalid': !!genderError }"
              />
              <label for="gender1" class="ml-2">女</label>
            </div>
          </div>
          <small class="p-error mt-1" v-if="genderError">{{
            genderError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label class="mb-2 block" for="naturalized_YES">是否歸化:</label>
          <div class="flex flex-wrap gap-3">
            <div class="flex align-items-center">
              <RadioButton
                inputId="naturalized_YES"
                name="naturalized"
                :value="1"
                v-model="selectednaturalized"
                :class="{ 'p-invalid': !!naturalizedError }"
              />
              <label for="naturalized_YES" class="ml-2">是</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="naturalized_NO"
                name="naturalized"
                :value="0"
                v-model="selectednaturalized"
                :class="{ 'p-invalid': !!naturalizedError }"
              />
              <label for="naturalized_NO" class="ml-2">否</label>
            </div>
            <div class="flex align-items-center">
              <Button
                type="button"
                icon="pi pi-times"
                class="p-button-secondary p-button-outlined p-button-sm ml-2"
                @click="clearNaturalized"
                aria-label="清除選擇"
              />
            </div>
          </div>
          <small class="p-error mt-1" v-if="naturalizedError">{{
            naturalizedError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <span id="sourcesSelect-label">轉介單位</span>
          <Select
            aria-labelledby="sourcesSelect-label"
            v-model="selectedsources"
            :options="sources_List"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇轉介單位"
            class="w-full"
            filter
            :class="{ 'p-invalid': !!sourcesError }"
          />
          <small class="p-error" v-if="sourcesError">{{ sourcesError }}</small>
        </div>

        <div class="field col-12 md:col-6" v-if="selectedsources === -1">
          <label for="othersources">請輸入其他轉介單位:</label>
          <InputText
            id="othersources"
            v-model="othersources"
            class="w-full"
            :class="{ 'p-invalid': !!othersourcesError }"
          />
          <small class="p-error" v-if="othersourcesError">{{
            othersourcesError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <span id="caseSourceSelect-label">個案來源類別</span>
          <Select
            aria-labelledby="caseSourceSelect-label"
            v-model="selectedCaseSource"
            :options="sourceCats_List"
            optionLabel="name"
            optionValue="id"
            placeholder="選擇轉介單位後自動帶入"
            class="w-full"
            filter
            :disabled="CategoryLock"
            :class="{ 'p-invalid': !!caseSourceError }"
          />
          <small class="p-error" v-if="caseSourceError">{{
            caseSourceError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <span id="townSelect-label">鄉鎮市區</span>
          <Select
            aria-labelledby="townSelect-label"
            v-model="selectedtown"
            :options="town_List"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇鄉鎮市區"
            class="w-full"
            filter
            :class="{ 'p-invalid': !!townError }"
          />
          <small class="p-error" v-if="townError">{{ townError }}</small>
        </div>

        <div class="field col-12 md:col-6" v-if="selectedtown === -1">
          <label for="othertown">請輸入其他鄉鎮市區:</label>
          <InputText
            id="othertown"
            v-model="othertown"
            class="w-full"
            :class="{ 'p-invalid': !!othertownError }"
          />
          <small class="p-error" v-if="othertownError">{{
            othertownError
          }}</small>
        </div>

        <div class="field col-12">
          <label for="caseDetail">關於該案的案情</label>
          <Textarea
            id="caseDetail"
            v-model="caseDetail"
            rows="5"
            class="w-full"
            :class="{ 'p-invalid': !!caseDetailError }"
            placeholder="關於該案的案情"
            autoResize
          />
          <small class="p-error" v-if="caseDetailError">{{
            caseDetailError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <span id="mainworkerSelect-label">主責社工</span>
          <Select
            aria-labelledby="mainworkerSelect-label"
            v-model="selectedworkers"
            :options="workers_List"
            optionLabel="fullName"
            optionValue="name"
            placeholder="請選擇主責社工"
            class="w-full"
            filter
            :class="{ 'p-invalid': !!workerError }"
          />
          <small class="p-error" v-if="workerError">{{ workerError }}</small>
        </div>

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
// ★ 步驟 1: 從 'vue' 導入 watch
import { ref, onMounted, watch } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useRouter } from "vue-router";
// --- PrimeVue 元件導入 ---
import { DatePicker } from "primevue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Select from "primevue/select";
("primevue");
import Textarea from "primevue/textarea";
import { useToast } from "primevue/usetoast";
// --- VeeValidate 導入 ---
import { useForm, useField, defineRule } from "vee-validate";

interface GeneralFormValues {
  filingDate: Date | null;
  caseNumber: string;
  FullName: string;
  nationality: number | null;
  othernationalities: string;
  selectedYear: number | null;
  gender: number | null;
  naturalized: number | null;
  sourceID: number | null;
  sourceOther: string;
  sourceCatID: number | null;
  town: number | null;
  othertown: string;
  caseDetail: string;
  worker: string | null;
}
const toast = useToast();
const router = useRouter();

// --- 定義 VeeValidate 規則 ---
defineRule("required", (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "此欄位為必填項";
  }
  return true;
});

// --- VeeValidate 表單設定 ---
const { handleSubmit, meta } = useForm<GeneralFormValues>({
  initialValues: {
    filingDate: null,
    caseNumber: "",
    FullName: "",
    nationality: null,
    othernationalities: "",
    selectedYear: null,
    gender: null,
    naturalized: null,
    sourceID: null,
    sourceOther: "",
    sourceCatID: null,
    town: null,
    othertown: "",
    caseDetail: "",
    worker: null,
  },
});

// --- 自訂驗證規則函數 ---
const validateOtherNationality = (value: string | undefined | null) => {
  if (selectednationalities.value === -1 && !value?.trim()) {
    return "請輸入其他國籍";
  }
  return true;
};
const validateOtherTown = (value: string | undefined | null) => {
  if (selectedtown.value === -1 && !value?.trim()) {
    return "請輸入其他鄉鎮市區";
  }
  return true;
};
const validateOtherSources = (value: string | undefined | null) => {
  if (selectedsources.value === -1 && !value?.trim()) {
    return "請輸入其他轉介單位";
  }
  return true;
};

// --- 為每個欄位使用 useField ---
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
);
const { value: FullName, errorMessage: FullNameError } = useField<string>(
  "FullName",
  "required",
);

function clearNaturalized() {
  selectednaturalized.value = null;
}
const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("nationality", "required");
const { value: othernationalities, errorMessage: othernationalitiesError } =
  useField<string>("othernationalities", validateOtherNationality);
const { value: selectedYear, errorMessage: selectedYearError } = useField<
  number | null
>("selectedYear");
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectednaturalized, errorMessage: naturalizedError } = useField<
  number | null
>("naturalized");
const { value: selectedsources, errorMessage: sourcesError } = useField<
  number | null
>("sourceID", "required");
const { value: othersources, errorMessage: othersourcesError } =
  useField<string>("sourceOther", validateOtherSources);

// ★ 步驟 2: 從 useField 中解構出 setValue 方法，並重新命名以避免衝突
const {
  value: selectedCaseSource,
  errorMessage: caseSourceError,
  setValue: setCaseSource, // 將 setValue 命名為 setCaseSource
} = useField<number | null>("sourceCatID", "required");

const { value: selectedtown, errorMessage: townError } = useField<
  number | null
>("town", "required");
const { value: othertown, errorMessage: othertownError } = useField<string>(
  "othertown",
  validateOtherTown,
);
const { value: caseDetail, errorMessage: caseDetailError } =
  useField<string>("caseDetail");
const { value: selectedworkers, errorMessage: workerError } = useField<
  string | null
>("worker", "required");

// --- API 選項數據 ref ---
const Nationality_List = ref<{ id: number; name: string }[]>([]);
const sourceCats_List = ref<{ id: number; name: string }[]>([]);
// 確保 sources_List 的類型定義包含 sourceCatID
const sources_List = ref<{ id: number; name: string; sourceCatID?: number }[]>(
  [],
);
const town_List = ref<{ id: number; name: string }[]>([]);
const workers_List = ref<{ name: string; fullName: string }[]>([]);

// --- 其他狀態 ---
const CategoryLock = ref(true); // 初始狀態為鎖定

// ★ 步驟 3: 新增 watch 函數來監聽轉介單位的變化
watch(selectedsources, (newSourceId) => {
  // 查找使用者選擇的轉介單位物件
  const selectedSource = sources_List.value.find(
    (source) => source.id === newSourceId,
  );

  // 情況一: 找到對應的轉介單位，且該單位有 sourceCatID

  if (selectedSource && selectedSource.sourceCatID == -1) {
    CategoryLock.value = false;
  } else if (selectedSource && selectedSource.sourceCatID !== undefined) {
    setCaseSource(selectedSource.sourceCatID);
    CategoryLock.value = true;
  }
});

// --- 生命週期鉤子 ---
onMounted(() => {
  const fetchOptions = (endpoint: string, listRef: any) => {
    apiHandler
      .get(endpoint)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          listRef.value = response.data.data;
        }
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "資料載入失敗",
          detail: `無法從 ${endpoint} 載入選項`,
          life: 3000,
        });
      });
  };

  fetchOptions("/option/nationalities", Nationality_List);
  fetchOptions("/option/sourceCats", sourceCats_List);
  fetchOptions("/option/sources", sources_List);
  fetchOptions("/option/towns", town_List);

  apiHandler
    .get("/option/workers")
    .then((response) => {
      if (response.data && Array.isArray(response.data.data)) {
        workers_List.value = response.data.data.map((worker: any) => ({
          name: worker.name,
          fullName: worker.fullName || worker.fullname,
        }));
      }
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "資料載入失敗",
        detail: `無法從 /option/workers 載入選項`,
        life: 3000,
      });
    });
});

// --- 提交處理 ---
const onSubmit = handleSubmit(async (values) => {
  // ... 提交邏輯維持不變 ...
  let formattedDate = null;
  if (values.filingDate && typeof values.filingDate.getMonth === "function") {
    try {
      formattedDate = format(values.filingDate, "yyyy-MM-dd");
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "錯誤",
        detail: "日期格式不正確",
        life: 3000,
      });
      return;
    }
  }

  const payload = {
    filingDate: formattedDate,
    caseNumber: values.caseNumber?.trim(),
    fullName: values.FullName?.trim(),
    nationalityID: values.nationality,
    nationalityOther:
      values.nationality === -1 ? values.othernationalities?.trim() : null,
    yearOfBirth: values.selectedYear,
    gender: values.gender,
    naturalized: values.naturalized === null ? null : values.naturalized === 1,
    sourceID: values.sourceID,
    sourceOther: values.sourceID === -1 ? values.sourceOther?.trim() : null,
    sourceCatID: values.sourceCatID,
    town: values.town,
    townOther: values.town === -1 ? values.othertown?.trim() : null,
    detail: values.caseDetail?.trim(),
    worker: values.worker,
  };

  try {
    await apiHandler.post("/form/assign/general", payload);
    toast.add({
      severity: "success",
      summary: "提交成功",
      detail: "您的表單已成功送出！",
      life: 1500,
    });
    setTimeout(() => {
      router.push("/");
    }, 1500);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "提交失敗",
      detail:
        error.response?.data?.error?.message || "發生未知錯誤，請稍後再試。",
      life: 3000,
    });
  }
});
</script>

<style scoped>
.p-field {
  margin-bottom: 1.5rem;
}
.p-error {
  display: block;
  margin-top: 0.25rem;
  color: var(--p-red-500);
  font-size: 0.875rem;
}
/* 清除按鈕樣式微調 */
.p-button-sm {
  padding: 0.3rem 0.5rem;
  font-size: 0.8rem;
}
#arrival-form-card .field {
  margin-bottom: 1rem;
}
</style>
