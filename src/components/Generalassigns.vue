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
          <RadioButton
            inputId="male"
            name="gender"
            :value="0"
            v-model="selectedGender"
            :class="{ 'p-invalid': !!genderError }"
          />
          <label for="male" class="ml-2">男</label>

          <RadioButton
            inputId="female"
            name="gender"
            :value="1"
            v-model="selectedGender"
            :class="{ 'p-invalid': !!genderError }"
          />
          <label for="female" class="ml-2">女</label>

          <RadioButton
            inputId="otherGenderRadio"
            name="gender"
            :value="2"
            v-model="selectedGender"
            :class="{ 'p-invalid': !!genderError }"
          />
          <label for="otherGenderRadio" class="ml-2">其他</label>

          <small class="p-error mt-1" v-if="genderError">{{
            genderError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label class="mb-2 block">是否歸化:</label>

          <RadioButton
            inputId="naturalized_YES"
            name="naturalized"
            :value="1"
            v-model="selectednaturalized"
            :class="{ 'p-invalid': !!naturalizedError }"
          />
          <label for="naturalized_YES" class="ml-2">是</label>

          <RadioButton
            inputId="naturalized_NO"
            name="naturalized"
            :value="0"
            v-model="selectednaturalized"
            :class="{ 'p-invalid': !!naturalizedError }"
          />
          <label for="naturalized_NO" class="ml-2">否</label>

          <Button
            type="button"
            icon="pi pi-times"
            class="p-button-secondary p-button-outlined p-button-sm ml-2"
            @click="clearNaturalized"
            aria-label="清除選擇"
          />

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
import { ref, onMounted, watch } from "vue"; // 保留 watch
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import { useRouter } from "vue-router";
// --- PrimeVue 元件導入 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber"; // 導入 InputNumber
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea"; // 導入 Textarea
// --- VeeValidate 導入 ---
import { useForm, useField } from "vee-validate"; // ErrorMessage 這次沒直接用
import { useToast } from "primevue/usetoast"; // 用於顯示成功/失敗提示
import { value } from "@primeuix/themes/aura/knob";
const toast = useToast(); // 初始化 Toast 服務
const router = useRouter();
// --- VeeValidate 表單設定 ---
// 添加了對應 Snippet 1 的所有欄位
const { handleSubmit, errors, meta, setFieldValue, values } = useForm({
  // 可以在這裡設定初始值，會覆蓋 useField 的 initialValue
  initialValues: {
    filingDate: null,
    caseNumber: "",
    FullName: "",
    nationality: null,
    othernationalities: "",
    selectedYear: null,
    gender: null,
    naturalized: null,
    sourceID: null, //轉借單位
    sourceOther: "",
    sourceCatID: null, // 個案來源類別
    town: null,
    othertown: "",
    caseDetail: "",
    worker: null,
    // needs: [], // 如果要處理 Needs MultiSelect
    // otherNeeds: ''
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
>("selectedYear" /*, 'required'*/); // 年份可能非必填
const { value: selectedGender, errorMessage: genderError } = useField<
  number | null
>("gender", "required");
const { value: selectednaturalized, errorMessage: naturalizedError } = useField<
  number | null
>("naturalized" /*, 'required'*/); // 歸化可能非必填
const { value: selectedsources, errorMessage: sourcesError } = useField<
  number | null
>("sourceID", "required");
const { value: othersources, errorMessage: othersourcesError } =
  useField<string>("sourceOther", validateOtherSources);
const { value: selectedCaseSource, errorMessage: caseSourceError } = useField<
  number | null
>("sourceCatID", "required"); // 個案來源類別
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
const { value: selectedworkers, errorMessage: workerError } = useField<
  number | null
>("worker", "required");
// --- API 選項數據 ref ---
const Nationality_List = ref<{ id: number; name: string }[]>([]);
const sourceCats_List = ref<{ id: number; name: string }[]>([]);
const sources_List = ref<{ id: number; name: string; sourceCatID?: number }[]>(
  [],
); // 假設 sources 有 sourceCatID
const town_List = ref<{ id: number; name: string }[]>([]);
const workers_List = ref<{ id: number; name: string }[]>([]);
// const Needs_List = ref<{ id: number; name: string }[]>([]);

// --- 其他狀態 ---
const CategoryLock = ref(true); // 控制個案來源類別是否禁用

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
  fetchOptions("/option/sourceCats", sourceCats_List);
  fetchOptions("/option/sources", sources_List);
  fetchOptions("/option/towns", town_List);
  fetchOptions("/option/workers", workers_List);
});

// --- 清除歸化選項 ---
const clearNaturalized = () => {
  setFieldValue("naturalized", null); // 使用 VeeValidate 的 setFieldValue 更新值
};

// --- 監聽轉介單位變化，自動更新個案來源類別 ---
watch(selectedsources, (newSourceId) => {
  if (newSourceId === null || newSourceId === undefined) {
    setFieldValue("sourceCatID", null); // 清空個案來源
    CategoryLock.value = true; // 可能需要重新鎖定
    return;
  }

  // 從 sources_List 找到對應的 source 物件
  const selectedSourceObject = sources_List.value.find(
    (item) => item.id === newSourceId,
  );

  if (selectedSourceObject) {
    const sourceCatID = selectedSourceObject.sourceCatID;
    // 從 source 物件找到對應的 sourceCatID
    if (sourceCatID !== undefined) {
      // 從 sourceCats_List 找到對應的類別物件
      const result = sourceCats_List.value.find(
        (cat) => cat.id === sourceCatID,
      );
      if (result) {
        setFieldValue("sourceCatID", result.id); // 更新 VeeValidate 的值
        // 控制鎖定狀態
        CategoryLock.value = result.id !== -1; // 假設 -1 代表可編輯
      } else {
        setFieldValue("sourceCatID", null); // 沒找到對應類別
        CategoryLock.value = false; // 沒找到就解鎖？或者保持鎖定？根據需求調整
      }
    } else {
      // 如果選擇的 source 沒有 sourceCatID
      setFieldValue("sourceCatID", null);
      CategoryLock.value = false; // 或者保持鎖定
    }
  } else {
    setFieldValue("sourceCatID", null); // 選擇項無效
    CategoryLock.value = true; // 或者 false？
  }
});

// --- 提交處理 (由 handleSubmit 包裹) ---
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

  // 從 values 構建 payload
  const payload = {
    filingDate: formattedDate, // 使用格式化後的日期，key 同 Snippet 1
    caseNumber: values.caseNumber?.trim(),
    fullName: values.FullName?.trim(), // key 同 Snippet 1
    nationalityID: values.nationality,
    nationalityOther:
      values.nationality === -1 ? values.othernationalities?.trim() : null,
    yearOfBirth: values.selectedYear ? values.selectedYear : null, // key 同 Snippet 1
    gender: Number(values.gender), // key 同 Snippet 1
    naturalized:
      values.naturalized !== null ? Boolean(Number(values.naturalized)) : null,

    sourceID: values.sourceID, //轉借單位
    sourceOther: othersources.value,
    sourceCatID: values.sourceCatID, //個案來源

    town: values.town, // key 同 Snippet 1
    townOther: values.town === -1 ? values.othertown?.trim() : null,
    detail: values.caseDetail?.trim(), // key 同 Snippet 1
    worker: values.worker, // key 同 Snippet 1
  };

  // 發送 API 請求到
  try {
    const response = await apiHandler.post("/form/assign/general", payload);
    toast.add({
      severity: "success", // 狀態：成功 (綠色)
      summary: "提交成功", // 標題
      detail: "您的表單已成功送出！", // 詳細內容
      life: 1500, // 顯示 1.5 秒後自動消失
    });

    // 6. 在 Toast 消失後轉跳到主頁
    setTimeout(() => {
      router.push("/"); // 轉跳到主頁
    }, 1500);
  } catch (error) {
    // 7. 顯示失敗的 Toast 通知
    toast.add({
      severity: "error", // 狀態：失敗 (紅色)
      summary: "提交失敗", // 標題
      detail: error.response.data.error.message, // 詳細內容 (從 API 回應中取得更佳)
      life: 3000, // 錯誤訊息顯示久一點
    });
  }
});
</script>

<style scoped>
/* 保持你原有的或其他需要的樣式 */
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
