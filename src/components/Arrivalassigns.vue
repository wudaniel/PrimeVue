<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境派案表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- 填表日期 -->
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

        <!-- 案號 -->
        <div class="field col-12 md:col-6">
          <label for="caseNumber">案號:</label>
          <InputText
            id="caseNumber"
            v-model="caseNumber"
            class="w-full"
            :class="{ 'p-invalid': !!caseNumberError }"
          />
          <small class="p-error" v-if="caseNumberError">{{
            caseNumberError
          }}</small>
        </div>

        <!-- 全名 -->
        <div class="field col-12 md:col-6">
          <label for="fullName">全名:</label>
          <InputText
            id="fullName"
            v-model="FullName"
            class="w-full"
            :class="{ 'p-invalid': !!FullNameError }"
          />
          <small class="p-error" v-if="FullNameError">{{
            FullNameError
          }}</small>
        </div>

        <!-- 原母國籍 -->
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

        <!-- 其他國籍 -->
        <div class="field col-12 md:col-6" v-if="selectednationalities === -1">
          <label for="othernationalities">請輸入其他國籍:</label>
          <InputText
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': !!othernationalitiesError }"
          />
          <small class="p-error" v-if="othernationalitiesError">{{
            othernationalitiesError
          }}</small>
        </div>

        <!-- 性別 -->
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
            <div class="flex align-items-center">
              <RadioButton
                inputId="gender2"
                name="gender"
                :value="2"
                v-model="selectedGender"
                :class="{ 'p-invalid': !!genderError }"
              />
              <label for="gender2" class="ml-2">其他</label>
            </div>
          </div>
          <small class="p-error mt-1" v-if="genderError">{{
            genderError
          }}</small>
        </div>

        <!-- 鄉鎮市區 -->
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

        <!-- 其他鄉鎮市區 -->
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

        <!-- 主責社工 -->
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

        <!-- 提交按鈕 -->
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
import { ref, onMounted } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useRouter } from "vue-router";

// --- PrimeVue 元件導入 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import { useToast } from "primevue/usetoast";

// --- VeeValidate 導入 ---
import { useForm, useField } from "vee-validate";

const toast = useToast();
const router = useRouter();

// --- VeeValidate 表單設定 ---
const { handleSubmit, meta } = useForm({
  initialValues: {
    filingDate: null,
    caseNumber: "",
    FullName: "",
    nationality: null,
    othernationalities: "",
    gender: null,
    town: null,
    othertown: "",
    worker: null,
  },
});

// --- 自訂驗證規則 ---
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
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectedtown, errorMessage: townError } = useField<
  number | null
>("town", "required");
const { value: othertown, errorMessage: othertownError } = useField<string>(
  "othertown",
  validateOtherTown,
);
const { value: selectedworkers, errorMessage: workerError } = useField<
  number | null
>("worker", "required");

// --- API 選項數據 ---
const Nationality_List = ref<{ id: number; name: string }[]>([]);
const town_List = ref<{ id: number; name: string }[]>([]);
const workers_List = ref<{ id: number; name: string }[]>([]);

// --- 生命週期鉤子 ---
onMounted(() => {
  const fetchOptions = (endpoint: string, listRef: any) => {
    apiHandler
      .get(endpoint)
      .then((response) => {
        // 假設後端回應結構為 { success: boolean, data: [...] }
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
  fetchOptions("/option/towns", town_List);
  fetchOptions("/option/workers", workers_List);
});

// --- 提交處理 ---
const onSubmit = handleSubmit(async (values) => {
  let formattedDate = null;
  if (
    values.filingDate instanceof Date &&
    !isNaN(values.filingDate.getTime())
  ) {
    try {
      formattedDate = format(values.filingDate, "yyyy-MM-dd");
    } catch (e) {
      console.error("日期格式化失敗:", e);
    }
  }

  // 從 values 構建 payload
  const payload = {
    filingDate: formattedDate,
    caseNumber: values.caseNumber?.trim(),
    fullName: values.FullName?.trim(),
    nationalityID: values.nationality,
    nationalityOther:
      values.nationality === -1 ? values.othernationalities?.trim() : null,
    gender: Number(values.gender),
    town: values.town,
    townOther: values.town === -1 ? values.othertown?.trim() : null,
    worker: values.worker,
  };

  try {
    // 注意: API 端點是 /form/assign/arrival
    await apiHandler.post("/form/assign/arrival", payload);

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
#arrival-form-card .field {
  margin-bottom: 1rem;
}
.p-error {
  display: block;
  margin-top: 0.25rem;
  color: var(--p-red-500);
  font-size: 0.875rem;
}
</style>
