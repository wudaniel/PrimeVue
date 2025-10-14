<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">一般派案表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <div class="field col-12 md:col-6">
          <label for="filingDate">填表日期:</label>
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
            placeholder="請輸入您的全名"
            class="w-full"
            :class="{ 'p-invalid': !!FullNameError }"
          />
          <small class="p-error" v-if="FullNameError">{{
            FullNameError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="nationalityDropdown">原母國籍</label>
          <Dropdown
            inputId="nationalityDropdown"
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
            id="yearInput"
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
          <label class="mb-2 block">性別:</label>
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
          <label class="mb-2 block">是否歸化:</label>
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
          <label for="sourcesDropdown">轉介單位</label>
          <Dropdown
            inputId="sourcesDropdown"
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
          <label for="caseSourceDropdown">個案來源類別</label>
          <Dropdown
            inputId="caseSourceDropdown"
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
          <label for="townDropdown">鄉鎮市區</label>
          <Dropdown
            inputId="townDropdown"
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
          <label for="mainworkerDropdown">主責社工</label>
          <Dropdown
            inputId="mainworkerDropdown"
            v-model="selectedworkers"
            :options="workers_List"
            optionLabel="name"
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
import { ref, onMounted, watch } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useRouter } from "vue-router";
// --- PrimeVue 元件導入 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
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
  sourceCatID: number | null; // <-- 在這裡明確定義類型
  town: number | null;
  othertown: string;
  caseDetail: string;
  worker: string | null; // 注意 worker 是 string | null
}
const toast = useToast();
const router = useRouter();

// --- 定義 VeeValidate 規則 ---
// 為了讓 'required' 字符串能穩定運作
defineRule("required", (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "此欄位為必填項";
  }
  return true;
});

// --- VeeValidate 表單設定 ---
const { handleSubmit, meta, setFieldValue } = useForm<GeneralFormValues>({
  // <-- 在此應用介面
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
    sourceCatID: null, // 現在 TS 知道這個 null 屬於 number | null 類型
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
const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("nationality", "required");
const { value: othernationalities, errorMessage: othernationalitiesError } =
  useField<string>("othernationalities", validateOtherNationality);
const { value: selectedYear, errorMessage: selectedYearError } = useField<
  number | null
>("selectedYear"); // 年份設為非必填
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectednaturalized, errorMessage: naturalizedError } = useField<
  number | null
>("naturalized"); // 歸化設為非必填
const { value: selectedsources, errorMessage: sourcesError } = useField<
  number | null
>("sourceID", "required");
const { value: othersources, errorMessage: othersourcesError } =
  useField<string>("sourceOther", validateOtherSources);
const { value: selectedCaseSource, errorMessage: caseSourceError } = useField<
  number | null
>("sourceCatID", "required");
const { value: selectedtown, errorMessage: townError } = useField<
  number | null
>("town", "required");
const { value: othertown, errorMessage: othertownError } = useField<string>(
  "othertown",
  validateOtherTown,
);
const { value: caseDetail, errorMessage: caseDetailError } = useField<string>(
  "caseDetail",
  "required",
);

// FIX: 將 `worker` 的類型從 `number` 改為 `string` 以匹配 Dropdown 的 `optionValue="name"`
const { value: selectedworkers, errorMessage: workerError } = useField<
  string | null
>("worker", "required");

// --- API 選項數據 ref ---
const Nationality_List = ref<{ id: number; name: string }[]>([]);
const sourceCats_List = ref<{ id: number; name: string }[]>([]);
const sources_List = ref<{ id: number; name: string; sourceCatID?: number }[]>(
  [],
);
const town_List = ref<{ id: number; name: string }[]>([]);
const workers_List = ref<{ id: number; name: string }[]>([]);

// --- 其他狀態 ---
const CategoryLock = ref(true);

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
      .catch((error) => {
        console.error(`獲取 ${endpoint} 選項失敗:`, error);
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
  fetchOptions("/option/workers", workers_List);
});

// --- 清除歸化選項 ---
const clearNaturalized = () => {
  setFieldValue("naturalized", null);
};

// --- 監聽轉介單位變化，自動更新個案來源類別 ---
watch(selectedsources, (newSourceId) => {
  if (newSourceId === null || newSourceId === undefined) {
    setFieldValue("sourceCatID", null);
    CategoryLock.value = true;
    return;
  }

  const selectedSourceObject = sources_List.value.find(
    (item) => item.id === newSourceId,
  );

  if (selectedSourceObject && selectedSourceObject.sourceCatID !== undefined) {
    setFieldValue("sourceCatID", selectedSourceObject.sourceCatID);
    // 假設只有 sourceCatID 為 -1 時才可編輯
    CategoryLock.value = selectedSourceObject.sourceCatID !== -1;
  } else {
    // 如果選擇的 source 沒有 sourceCatID 或找不到，則解鎖讓用戶手動選擇
    setFieldValue("sourceCatID", null);
    CategoryLock.value = false;
  }
});

// --- 提交處理 ---
const onSubmit = handleSubmit(async (values) => {
  let formattedDate = null;
  // 確保 `values.filingDate` 是一個有效的 Date 物件
  if (values.filingDate && typeof values.filingDate.getMonth === "function") {
    try {
      formattedDate = format(values.filingDate, "yyyy-MM-dd");
    } catch (e) {
      console.error("日期格式化失敗:", e);
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
    gender: values.gender, // gender 已經是 number 或 null
    naturalized: values.naturalized === null ? null : values.naturalized === 1, // 轉換 0/1 為 false/true
    sourceID: values.sourceID,
    sourceOther: values.sourceID === -1 ? values.sourceOther?.trim() : null, // BEST PRACTICE: 從 values 取值
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
