<template>
  <div id="arrival-form-card" class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <div class="field col-50 md:col-10">
          <label for="filingDate">建檔日:</label>
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
          <label for="nationalityDropdown">原母國籍:</label>
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
          <label for="othernationalities">請輸入其他國籍:</label>

          <Textarea
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
            :class="{ 'p-invalid': !!othernationalitiesError }"
            rows="1"
            autoResize
          />
          <small class="p-error" v-if="othernationalitiesError">{{
            othernationalitiesError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="target">對象名稱:</label>
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
          <label class="mb-2 block">性別:</label>

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

          <small class="p-error mt-1" v-if="genderError">{{
            genderError
          }}</small>
        </div>

        <div class="field col-12 md:col-6">
          <label for="serviceMethodsDropdown">服務方式:</label>
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
          <label for="otherServicemethods">請輸入其他服務方式:</label>
          <Textarea
            id="otherServicemethods"
            v-model="otherServicemethods"
            class="w-full"
            :class="{ 'p-invalid': !!otherServicemethodsError }"
            rows="1"
            autoResize
          />
          <small class="p-error" v-if="otherServicemethodsError">{{
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
          <label for="serviceObject">服務項目:</label>
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
                <label :for="'unit-' + extra.id">{{ extra.name }} 單位:</label>

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
                  >{{ extra.name }} 內容:</label
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

            <div v-else class="col-12">
              <small>正在初始化 {{ extra.name }} 的欄位...</small>
            </div>
          </div>
        </div>

        <div class="field col-12" v-if="isServiceObjectOtherSelected">
          <label for="otherServiceobject">請輸入其他需求：</label>
          <Textarea
            id="otherServiceobject"
            v-model="otherServiceobject"
            class="w-full"
            :class="{ 'p-invalid': !!otherServiceobjectError }"
            rows="3"
            autoResize
          />
          <small class="p-error" v-if="otherServiceobjectError">{{
            otherServiceobjectError
          }}</small>
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
import { ref, onMounted, computed, watch, reactive, nextTick } from "vue"; // 仍然需要 watch 和 reactive
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
// --- PrimeVue 元件導入 ---
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import RadioButton from "primevue/radiobutton";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import MultiSelect from "primevue/multiselect"; // 導入 MultiSelect
// --- VeeValidate 導入 ---
import { useForm, useField } from "vee-validate"; // 不再需要 FieldContext 或 ErrorMessage (如果動態欄位不用)

// --- 類型定義 (幫助 TypeScript) ---
interface SelectOption {
  id: number;
  name: string;
}
interface ServiceObjectOption extends SelectOption {
  extra?: boolean;
} // 假設服務項目有 extra 屬性
interface ExtraInput {
  unit: string;
  content: string;
}

// --- VeeValidate 表單設定 (只用於靜態欄位) ---
const { handleSubmit, errors, meta, values } = useForm({}); // 不再需要 defineField, setFieldValue, unregister

// Filing Date
const filingFieldContext = useField<Date | null>("filingDate", "required", {
  initialValue: null,
});
const filingDate = filingFieldContext.value; // 獲取 value ref
const filingDateError = filingFieldContext.errorMessage; // 獲取 errorMessage ref

// Case Number
const caseNumberFieldContext = useField<string>("caseNumber", "required", {
  initialValue: "",
});
const caseNumber = caseNumberFieldContext.value;
const caseNumberError = caseNumberFieldContext.errorMessage;

// Nationality
const nationalityFieldContext = useField<number | null>(
  "nationality",
  "required",
  { initialValue: null },
);
const selectednationalities = nationalityFieldContext.value; // 保持模板使用的變數名
const nationalityError = nationalityFieldContext.errorMessage;

// Target
const targetFieldContext = useField<string>("target", "required", {
  initialValue: "",
});
const target = targetFieldContext.value;
const targetError = targetFieldContext.errorMessage;

// Gender
const genderFieldContext = useField<number | null>("gender", "required", {
  initialValue: null,
});
const selectedGender = genderFieldContext.value; // 保持模板使用的變數名
const genderError = genderFieldContext.errorMessage;

// Service Method
const serviceMethodFieldContext = useField<number | null>(
  "serviceMethod",
  "required",
  { initialValue: null },
);
const selectedServicemethods = serviceMethodFieldContext.value; // 保持模板使用的變數名
const servicemethodsError = serviceMethodFieldContext.errorMessage;

// Task Object (非必填)
const taskObjectFieldContext = useField<string>("taskObject", undefined, {
  initialValue: "",
});
const taskObject = taskObjectFieldContext.value;
const taskObjectError = taskObjectFieldContext.errorMessage;

// Detail (非必填)
const detailFieldContext = useField<string>("detail", undefined, {
  initialValue: "",
});
const detail = detailFieldContext.value;
const detailError = detailFieldContext.errorMessage;

// Service Object (MultiSelect - 必填)
const serviceObjectFieldContext = useField<number[] | undefined>(
  "serviceObjectID",
  (value) => {
    if (!value || value.length === 0) {
      return "請選擇至少一個服務項目";
    }
    return true;
  },
  { initialValue: [] },
);
const selectedServiceobject = serviceObjectFieldContext.value; // 保持模板使用的變數名
const serviceObjectError = serviceObjectFieldContext.errorMessage;
// otherServiceobject 手動驗證

// --- API 選項數據 ref ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]); // 使用 ServiceObjectOption 類型

// --- 動態額外欄位數據 ---
const extraInputValues = reactive<Record<number, ExtraInput>>({});
// --- 手動管理動態欄位的錯誤 ---
const dynamicErrors = reactive<Record<string, string | null>>({});
// --- ref for 手動驗證的欄位 (如果 v-model 需要) ---
// 這些 ref 的值會與 extraInputValues 同步，主要用於 v-if 條件判斷或自訂驗證函數
const othernationalities = ref("");
const otherServicemethods = ref("");
const otherServiceobject = ref("");
// 計算屬性：獲取選中且需要額外輸入的服務項目
const selectedExtraItems = computed(() => {
  const selectedIds = selectedServiceobject.value || [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
});

// 計算屬性：檢查是否選中了 "其他服務項目"
const isServiceObjectOtherSelected = computed(() => {
  return selectedServiceobject.value?.includes(-1) ?? false; // 假設 "其他" ID 是 -1
});
// --- 監聽選中的額外項目變化，動態添加/移除 VeeValidate 欄位 ---
// 監聽計算屬性 selectedExtraItems 的變化

watch(
  selectedExtraItems,
  (newItems, oldItems) => {
    /*console.log("WATCHER (Simplified): selectedExtraItems changed", {
      newItems,
      oldItems,
    });*/
    if (!Array.isArray(newItems)) return;
    oldItems = oldItems ?? [];

    const currentExtraIds = new Set(newItems.map((item) => item.id));

    // 確保新增項目的數據結構存在
    newItems.forEach((item) => {
      if (item && typeof item.id === "number" && !extraInputValues[item.id]) {
        //(`Initializing extraInputValues for ID: ${item.id}`);
        extraInputValues[item.id] = { unit: "", content: "" };
      }
    });

    // 清理移除項目的數據和手動錯誤
    const oldIds = oldItems.map((item) => item.id);
    oldIds.forEach((id) => {
      if (typeof id === "number" && !currentExtraIds.has(id)) {
        //console.log(`Cleaning up data for removed item ID: ${id}`);
        delete extraInputValues[id];
        delete dynamicErrors[`extraUnit_${id}`]; // 清除手動錯誤
        delete dynamicErrors[`extraContent_${id}`]; // 清除手動錯誤
      }
    });
  },
  { deep: true, flush: "post" }, // 保持 deep 和 flush
);

// --- 監聽 '其他' 選項，同步到獨立 ref (如果自訂驗證需要) ---
// 這個 watch 用來確保其他國籍等欄位的值與 extraInputValues 同步，以便自訂驗證函數使用
watch(
  () => selectednationalities.value,
  (newVal) => {
    if (newVal !== -1) othernationalities.value = ""; // 如果不是其他，清空 ref
  },
);
watch(
  () => extraInputValues[-1]?.unit,
  (newVal) => {
    // 假設其他國籍用 -1
    if (selectednationalities.value === -1)
      othernationalities.value = newVal ?? "";
  },
);
// 同理監聽其他 '其他' 選項

// --- 生命週期鉤子 ---
onMounted(() => {
  // --- API 呼叫，獲取選項列表 ---
  apiHandler
    .get("/option/nationalities")
    .then((response) => {
      nationalityList.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
  apiHandler
    .get("/option/serviceMethods")
    .then((response) => {
      serviceMethodsList.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
  apiHandler
    .get("/option/serviceObjects")
    .then((response) => {
      serviceObjectList.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
});

// --- 提交處理 (包含手動驗證動態欄位) ---
const onSubmit = handleSubmit(
  async (values) => {
    // values 只包含 VeeValidate 管理的靜態欄位

    // --- 手動驗證邏輯 ---
    let isFormValid = true; // 先假設表單有效
    // 清空舊的動態錯誤
    Object.keys(dynamicErrors).forEach((key) => (dynamicErrors[key] = null));

    // 1. 驗證 othernationalities (如果國籍選了 '其他')
    if (values.nationality === -1 && !othernationalities.value?.trim()) {
      dynamicErrors.othernationalities = "請輸入其他國籍"; // 使用獨立的 ref 進行判斷
      isFormValid = false;
    }
    // 2. 驗證 otherServicemethods (如果服務方式選了 '其他')
    if (values.serviceMethod === -1 && !otherServicemethods.value?.trim()) {
      dynamicErrors.otherServicemethods = "請輸入其他服務方式";
      isFormValid = false;
    }
    // 3. 驗證 otherServiceobject (如果服務項目選了 '其他')
    if (
      values.serviceObjectID?.includes(-1) &&
      !otherServiceobject.value?.trim()
    ) {
      dynamicErrors.otherServiceobject = "請輸入其他需求";
      isFormValid = false;
    }
    // 4. 驗證動態生成的 extraInputValues
    for (const extraItem of selectedExtraItems.value) {
      const itemId = extraItem.id;
      const unitFieldName = `extraUnit_${itemId}`;
      const contentFieldName = `extraContent_${itemId}`;

      // 檢查 extraInputValues 中是否存在該條目 (理論上 watch 會處理，但再次檢查更安全)
      if (!extraInputValues[itemId]) {
        console.error(
          `Missing extraInputValues for ID: ${itemId} during submit`,
        );
        dynamicErrors[unitFieldName] = "欄位數據缺失";
        dynamicErrors[contentFieldName] = "欄位數據缺失";
        isFormValid = false;
        continue; // 繼續檢查下一個
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

    // --- 如果手動驗證或 VeeValidate 驗證 (meta.valid) 失敗，阻止提交 ---
    // meta.valid 只反映靜態欄位的驗證狀態
    if (!isFormValid || !meta.value.valid) {
      console.error("表單驗證失敗", {
        staticErrors: errors.value,
        dynamicErrors,
      });
      alert("表單包含錯誤，請檢查後再提交！");
      return; // 阻止提交
    }

    // --- 所有驗證通過 ---
    console.log("表單驗證通過");

    // 格式化日期
    let formattedDate = null; /* ... */

    // 構建 extraInfo (從 extraInputValues 取值)
    const extraInfo = selectedExtraItems.value.map((extraItem) => ({
      /* ... */
    }));

    // 構建 payload (混合 values 和 手動 ref/reactive)
    const payload = {
      filingDate: formattedDate,
      caseNumber: values.caseNumber?.trim(),
      nationalityID: values.nationality,
      // **注意：從獨立 ref 取值，而不是 values**
      nationalityOther:
        values.nationality === -1 ? othernationalities.value?.trim() : null,
      target: values.target?.trim(),
      gender: Number(values.gender),
      serviceMethod: values.serviceMethod,
      // **注意：從獨立 ref 取值**
      serviceMethodOther:
        values.serviceMethod === -1 ? otherServicemethods.value?.trim() : null,
      taskObject: values.taskObject?.trim(),
      detail: values.detail?.trim(),
      serviceObjectID: values.serviceObjectID,
      // **注意：從獨立 ref 取值**
      serviceObjectOther: values.serviceObjectID?.includes(-1)
        ? otherServiceobject.value?.trim()
        : null,
      extraInfo: extraInfo,
    };
    //console.log("Submitting:", payload);

    // API 請求...
    // try { await apiHandler.post... } catch { ... }
  },
  (context) => {
    // VeeValidate 靜態欄位驗證失敗回調
    //console.log("靜態欄位驗證失敗", context.errors);
    // 如果動態欄位也可能有錯，最好統一在上面 isFormValid 判斷後提示
  },
);
</script>

<style scoped>
#arrival-form-card .field {
  margin-bottom: 1rem;
}
</style>
