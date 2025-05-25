<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境派案表</h3>
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
            :class="{ 'p-invalid': errors.filingDate }"
          />

          <ErrorMessage name="filingDate" as="small" class="p-error" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="caseNumber">案號:</label>
          <InputText
            id="caseNumber"
            v-model="caseNumber"
            class="w-full"
            :class="{ 'p-invalid': errors.caseNumber }"
          />

          <ErrorMessage name="caseNumber" as="small" class="p-error" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="fullName">全名:</label>
          <InputText
            id="fullName"
            v-model="FullName"
            class="w-full"
            :class="{ 'p-invalid': errors.FullName }"
          />

          <ErrorMessage name="FullName" as="small" class="p-error" />
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
            :class="{ 'p-invalid': errors.nationality }"
          />

          <ErrorMessage name="nationality" as="small" class="p-error" />
        </div>

        <div class="field col-12 md:col-6" v-if="selectednationalities === -1">
          <label for="othernationalities">請輸入其他國籍:</label>
          <InputText
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': errors.othernationalities }"
          />
          <ErrorMessage name="othernationalities" as="small" class="p-error" />
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
              />
              <label for="gender0" class="ml-2">男</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="gender1"
                name="gender"
                :value="1"
                v-model="selectedGender"
              />
              <label for="gender1" class="ml-2">女</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="gender2"
                name="gender"
                :value="2"
                v-model="selectedGender"
              />
              <label for="gender2" class="ml-2">其他</label>
            </div>
          </div>

          <ErrorMessage name="gender" as="small" class="p-error mt-1" />
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
            :class="{ 'p-invalid': errors.town }"
          />
          <ErrorMessage name="town" as="small" class="p-error" />
        </div>

        <div class="field col-12 md:col-6" v-if="selectedtown === -1">
          <label for="othertown">請輸入其他鄉鎮市區:</label>
          <InputText
            id="othertown"
            v-model="othertown"
            class="w-full"
            :class="{ 'p-invalid': errors.othertown }"
          />
          <ErrorMessage name="othertown" as="small" class="p-error" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="mainworkerDropdown">主責社工</label>
          <Dropdown
            inputId="mainworkerDropdown"
            v-model="selectedworkers"
            :options="workers_List"
            optionLabel="name"
            optionValue="id"
            placeholder="請選擇主責社工"
            class="w-full"
            filter
            :class="{ 'p-invalid': errors.worker }"
          />
          <ErrorMessage name="worker" as="small" class="p-error" />
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
import { ref, onMounted, computed } from "vue"; // 導入 computed
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
// --- PrimeVue 元件導入 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
// import SelectButton from "primevue/selectbutton"; // 假設你改用 Dropdown 了
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
// --- VeeValidate 導入 ---
import { useForm, useField, ErrorMessage } from "vee-validate";

const validateOtherNationality = (value: string | undefined | null) => {
  // 依賴於 selectednationalities ref 的當前值
  if (selectednationalities.value === -1 && !value?.trim()) {
    return "請輸入其他國籍"; // 返回錯誤訊息
  }
  return true; // 驗證通過
};

const validateOtherTown = (value: string | undefined | null) => {
  // 依賴於 selectedtown ref 的當前值
  if (selectedtown.value === -1 && !value?.trim()) {
    return "請輸入其他鄉鎮市區";
  }
  return true;
};
// --- 為每個欄位使用 useField ---
const { handleSubmit, errors, meta, setFieldValue } = useForm({});
// useField 返回一個包含 value ref 和其他屬性的物件
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required", { initialValue: null });

const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
  { initialValue: "" },
);

const { value: FullName, errorMessage: FullNameError } = useField<string>(
  "FullName",
  "required",
  { initialValue: "" },
);
const { value: selectednationalities, errorMessage: nationalityError } =
  useField<number | null>("nationality", "required", { initialValue: null });

const { value: othernationalities, errorMessage: othernationalitiesError } =
  useField<string>("othernationalities", validateOtherNationality, {
    initialValue: "",
  });
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required", { initialValue: null });
const { value: selectedtown, errorMessage: townError } = useField<
  number | null
>("town", "required", { initialValue: null });

const { value: othertown, errorMessage: othertownError } = useField<string>(
  "othertown",
  validateOtherTown,
  { initialValue: "" },
);
const { value: selectedworkers, errorMessage: workerError } = useField<
  number | null
>("worker", "required", { initialValue: null });

const Nationality_List = ref<{ id: number; name: string }[]>([]);
const town_List = ref<{ id: number; name: string }[]>([]);
const workers_List = ref<{ id: number; name: string }[]>([]);

onMounted(() => {
  apiHandler
    .get("/option/nationalities")
    .then((response) => {
      Nationality_List.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
  apiHandler
    .get("/option/towns")
    .then((response) => {
      console.log(response.data);
      town_List.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
  apiHandler
    .get("/option/workers")
    .then((response) => {
      workers_List.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
});
const onSubmit = handleSubmit(async (values) => {
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
  const payload = {
    filing_date: formattedDate,
    case_number: values.caseNumber?.trim(),
    full_name: values.FullName?.trim(), // 使用 values 中的 FullName
    nationality_id: values.nationality,
    nationality_other:
      values.nationality === -1 ? values.othernationalities?.trim() : null,
    gender: values.gender,
    town_id: values.town,
    town_other: values.town === -1 ? values.othertown?.trim() : null,
    worker_id: values.worker,
  };
  console.log("Submitting:", payload);
  apiHandler
    .post("/form/assign/arrival", {
      filing_date: formattedDate,
      case_number: values.caseNumber?.trim(),
      full_name: values.FullName?.trim(), // 使用 values 中的 FullName
      nationality_id: values.nationality,
      nationality_other:
        values.nationality === -1 ? values.othernationalities?.trim() : null,
      gender: values.gender,
      town_id: values.town,
      town_other: values.town === -1 ? values.othertown?.trim() : null,
      worker_id: values.worker,
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<style scoped>
.p-fluid {
  padding: 20px;
}

.p-field {
  margin-bottom: 20px;
}
#arrival-form-card .field {
  margin-bottom: 1rem;
}
</style>
