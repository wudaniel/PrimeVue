<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境派案表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- ... other form fields are unchanged ... -->
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
            placeholder="請輸入案號"
            v-model="caseNumber"
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
            placeholder="請輸入案主姓名"
            v-model="FullName"
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
          />
          <small class="p-error" v-if="othernationalitiesError">{{
            othernationalitiesError
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

        <!-- 主責社工 -->
        <div class="field col-12 md:col-6">
          <span id="mainworkerSelect-label">主責社工</span>
          <!-- ★★★ 修改點 1: 將 optionLabel 改為 "fullName" ★★★ -->
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
import { DatePicker } from "primevue";
import InputText from "primevue/inputtext";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Select from "primevue/select";
("primevue");
import { useToast } from "primevue/usetoast";
// --- VeeValidate 導入 ---
import { useForm, useField, defineRule } from "vee-validate";

const toast = useToast();
const router = useRouter();

// --- 定義 VeeValidate 規則 ---
defineRule("required", (value: any) => {
  if (!value && value !== 0) {
    return "此欄位為必填項";
  }
  return true;
});

// --- VeeValidate 表單設定 ---
const { handleSubmit, meta } = useForm({
  /* ... */
});

// --- 為每個欄位使用 useField (無變動) ---
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
const validateOtherNationality = (value: string | undefined | null) => {
  // 檢查 "原母國籍" 下拉選單是否選擇了 "其他" (-1)
  if (selectednationalities.value === -1) {
    // 如果是 "其他"，則此欄位為必填
    if (!value || !value.trim()) {
      return "請輸入其他國籍"; // 驗證失敗，返回錯誤訊息
    }
  }
  // 如果下拉選單不是 "其他"，或此欄位已填寫，則驗證通過
  return true;
};
const { value: othernationalities, errorMessage: othernationalitiesError } =
  useField<string>("othernationalities", validateOtherNationality);
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectedtown, errorMessage: townError } = useField<
  number | null
>("town", "required");
const validateOtherTown = (value: string | undefined | null) => {
  // 檢查 "鄉鎮市區" 下拉選單是否選擇了 "其他" (-1)
  if (selectedtown.value === -1) {
    // 如果是 "其他"，則此欄位為必填
    if (!value || !value.trim()) {
      return "請輸入其他鄉鎮市區"; // 驗證失敗，返回錯誤訊息
    }
  }
  // 如果下拉選單不是 "其他"，或此欄位已填寫，則驗證通過
  return true;
};
const { value: othertown, errorMessage: othertownError } = useField<string>(
  "othertown",
  validateOtherTown,
);
const { value: selectedworkers, errorMessage: workerError } = useField<
  string | null
>("worker", "required");

// --- API 選項數據 ---
const Nationality_List = ref<{ id: number; name: string }[]>([]);
const town_List = ref<{ id: number; name: string }[]>([]);

// ★★★ 修改點 2: 更新 workers_List 的類型定義 ★★★
const workers_List = ref<{ name: string; fullName: string }[]>([]);

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
  fetchOptions("/option/towns", town_List);

  // ★★★ 修改點 3: 獨立處理 workers，並進行資料轉換 ★★★
  apiHandler
    .get("/option/workers")
    .then((response) => {
      if (response.data && Array.isArray(response.data.data)) {
        // 使用 .map 轉換資料，確保屬性名稱是 'fullName'
        workers_List.value = response.data.data.map((worker: any) => ({
          name: worker.name,
          // 這行程式碼會先嘗試取 worker.fullName，如果沒有，再嘗試取 worker.fullname
          // 這樣可以讓程式碼更穩健，不怕後端大小寫變動
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

// --- 提交處理 (無變動) ---
const onSubmit = handleSubmit(async (values) => {
  // ... 提交邏輯保持不變 ...
  let formattedDate = null;
  if (values.filingDate) {
    try {
      formattedDate = format(new Date(values.filingDate), "yyyy-MM-dd");
    } catch (e) {
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
    gender: values.gender,
    town: values.town,
    townOther: values.town === -1 ? values.othertown?.trim() : null,
    worker: values.worker,
  };

  try {
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
