<template>
  <div class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">一般紀錄表</h3>
    <form @submit="onSubmit">
      <div class="grid formgrid">
        <!-- 建檔日 和 案號 保持不變 -->
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

        <div class="col-12">
          <div class="flex justify-content-between align-items-center mb-2">
            <label class="font-bold"
              >對象: <span class="text-red-500">*</span></label
            >
            <div>
              <!-- ★★★ 修改點 1: 移除全域的 "-" 按鈕 ★★★ -->
              <Button
                icon="pi pi-plus"
                class="p-button-success"
                @click="addTarget"
                type="button"
                v-tooltip.top="'新增對象'"
              />
            </div>
          </div>
          <small class="p-error mb-2" v-if="targetArrayError">{{
            targetArrayError
          }}</small>

          <div
            v-for="(field, idx) in targetFields"
            :key="field.key"
            class="p-3 border-1 surface-border border-round mb-3"
          >
            <!-- ★★★ 修改點 2: 在每個對象區塊的標題旁新增獨立的刪除按鈕 ★★★ -->
            <div class="flex justify-content-between align-items-center mb-3">
              <h4 class="mt-0 mb-0">對象 {{ idx + 1 }}</h4>
              <Button
                icon="pi pi-trash"
                class="p-button-danger p-button-sm"
                type="button"
                @click="removeTarget(idx)"
                v-tooltip.top="'移除此對象'"
              />
            </div>

            <div class="grid formgrid">
              <!-- 對象姓名 -->
              <div class="field col-12 md:col-4">
                <label :for="`target-name-${idx}`"
                  >名稱: <span class="text-red-500">*</span></label
                >
                <InputText
                  :id="`target-name-${idx}`"
                  v-model="field.value.name"
                  placeholder="對象名稱"
                  class="w-full"
                  :class="{ 'p-invalid': !!targetErrors[idx]?.name }"
                />
                <small class="p-error" v-if="targetErrors[idx]?.name">{{
                  targetErrors[idx]?.name
                }}</small>
              </div>

              <!-- 對象性別 -->
              <div class="field col-12 md:col-4">
                <label class="mb-2 block"
                  >性別: <span class="text-red-500">*</span></label
                >
                <div class="flex flex-wrap gap-3">
                  <div class="flex align-items-center">
                    <RadioButton
                      :inputId="`male-${idx}`"
                      :name="`gender-${field.key}`"
                      :value="0"
                      v-model="field.value.gender"
                    /><label :for="`male-${idx}`" class="ml-2">男</label>
                  </div>
                  <div class="flex align-items-center">
                    <RadioButton
                      :inputId="`female-${idx}`"
                      :name="`gender-${field.key}`"
                      :value="1"
                      v-model="field.value.gender"
                    /><label :for="`female-${idx}`" class="ml-2">女</label>
                  </div>
                </div>
                <small class="p-error mt-1" v-if="targetErrors[idx]?.gender">{{
                  targetErrors[idx]?.gender
                }}</small>
              </div>

              <!-- 對象國籍 -->
              <div class="field col-12 md:col-4">
                <label :for="`target-nationality-${idx}`"
                  >國籍: <span class="text-red-500">*</span></label
                >
                <Dropdown
                  :inputId="`target-nationality-${idx}`"
                  v-model="field.value.nationalityID"
                  :options="nationalityList"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="請選擇國籍"
                  class="w-full"
                  filter
                  :class="{ 'p-invalid': !!targetErrors[idx]?.nationalityID }"
                />
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.nationalityID"
                  >{{ targetErrors[idx]?.nationalityID }}</small
                >
              </div>

              <!-- 對象其他國籍 -->
              <div class="field col-12" v-if="field.value.nationalityID === -1">
                <label :for="`target-other-nationality-${idx}`"
                  >請輸入其他國籍: <span class="text-red-500">*</span></label
                >
                <Textarea
                  :id="`target-other-nationality-${idx}`"
                  v-model="field.value.nationalityOther"
                  class="w-full"
                  :class="{
                    'p-invalid': !!targetErrors[idx]?.nationalityOther,
                  }"
                  rows="1"
                  autoResize
                />
                <small
                  class="p-error"
                  v-if="targetErrors[idx]?.nationalityOther"
                  >{{ targetErrors[idx]?.nationalityOther }}</small
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 服務方式及之後的欄位保持不變 -->
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
          <label>服務項目: <span class="text-red-500">*</span></label>
          <div
            class="grid mt-2"
            :class="{
              'border-2 border-red-500 border-round p-1': !!serviceItemError,
            }"
          >
            <div
              v-for="item in serviceObjectList"
              :key="item.id"
              class="col-12 md:col-3 p-1"
            >
              <div class="flex align-items-center">
                <Checkbox
                  :inputId="'serviceItem-' + item.id"
                  name="serviceItems"
                  :value="item.id"
                  v-model="selectedserviceItem"
                />
                <label :for="'serviceItem-' + item.id" class="ml-2">{{
                  item.name
                }}</label>
              </div>
            </div>
          </div>
          <small class="p-error" v-if="serviceItemError">{{
            serviceItemError
          }}</small>
        </div>
        <div class="col-12">
          <div class="grid formgrid">
            <div
              v-for="extra in selectedExtraItems"
              :key="extra.id"
              class="col-12 md:col-6 lg:col-4"
            >
              <div class="p-3 border-1 surface-border border-round h-full">
                <h4 class="mt-0 mb-3">{{ extra.name }}</h4>
                <div class="field">
                  <label :for="'unit-' + extra.id"
                    >單位: <span class="text-red-500">*</span></label
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
                    >{{ dynamicErrors[`extraUnit_${extra.id}`] }}</small
                  >
                </div>
                <div class="field">
                  <label :for="'content-' + extra.id"
                    >內容: <span class="text-red-500">*</span></label
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
                    >{{ dynamicErrors[`extraContent_${extra.id}`] }}</small
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field col-12" v-if="isserviceItemOtherSelected">
          <label for="otherserviceItem"
            >請輸入其他需求：<span class="text-red-500">*</span></label
          >
          <Textarea
            id="otherserviceItem"
            v-model="otherserviceItem"
            class="w-full"
            :class="{ 'p-invalid': !!dynamicErrors.otherserviceItem }"
            rows="3"
            autoResize
          />
          <small class="p-error" v-if="dynamicErrors.otherserviceItem">{{
            dynamicErrors.otherserviceItem
          }}</small>
        </div>
        <div class="field col-12 flex justify-content-end">
          <Button type="submit" label="提交" icon="pi pi-check" />
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
import Checkbox from "primevue/checkbox";

// --- VeeValidate ---
import { useForm, useField, useFieldArray, defineRule } from "vee-validate";

defineRule("required", (value: any) => {
  if (!value && value !== 0) {
    return "此欄位為必填";
  }
  return true;
});

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
interface Target {
  name: string;
  gender: number | null;
  nationalityID: number | null;
  nationalityOther: string;
}

// --- Hooks ---
const toast = useToast();
const router = useRouter();

// --- Props ---
const props = defineProps<{
  caseNumberQuery?: string;
}>();

// --- Form State ---
const { handleSubmit, meta } = useForm({});
const isSubmitting = ref(false);

// --- VeeValidate Field Definitions ---
const { value: filingDate, errorMessage: filingDateError } =
  useField<Date | null>("filingDate", "required");
const { value: caseNumber, errorMessage: caseNumberError } = useField<string>(
  "caseNumber",
  "required",
  { initialValue: props.caseNumberQuery || "" },
);
const { fields: targetFields, push, remove } = useFieldArray<Target>("targets");
const { errorMessage: targetArrayError } = useField<Target[]>(
  "targets",
  (value) => (value && value.length > 0 ? true : "請至少新增一個對象"),
  { initialValue: [] },
);
const { value: selectedServicemethods, errorMessage: servicemethodsError } =
  useField<number | null>("serviceMethod", "required");
const { value: taskObject, errorMessage: taskObjectError } =
  useField<string>("taskObject");
const { value: detail, errorMessage: detailError } = useField<string>("detail");
const { value: selectedserviceItem, errorMessage: serviceItemError } = useField<
  number[]
>(
  "serviceItemID",
  (value) => (value && value.length > 0 ? true : "請選擇至少一個服務項目"),
  { initialValue: [] },
);

// --- Manually Handled Fields ---
const otherServicemethods = ref("");
const otherserviceItem = ref("");
const extraInputValues = reactive<Record<number, ExtraInput>>({});
const dynamicErrors = reactive<Record<string, string | null>>({});
const targetErrors = reactive<Array<Partial<Record<keyof Target, string>>>>([]);

// --- API Option Lists ---
const nationalityList = ref<SelectOption[]>([]);
const serviceMethodsList = ref<SelectOption[]>([]);
const serviceObjectList = ref<ServiceObjectOption[]>([]);

// --- Computed Properties ---
const selectedExtraItems = computed(() => {
  const selectedIds = selectedserviceItem.value ?? [];
  return serviceObjectList.value.filter(
    (item) => item.extra && selectedIds.includes(item.id),
  );
});
const isserviceItemOtherSelected = computed(
  () => selectedserviceItem.value?.includes(-1) ?? false,
);

const addTarget = () => {
  push({
    name: "",
    gender: null,
    nationalityID: null,
    nationalityOther: "",
  });
  targetErrors.push({});
};

// ★★★ 修改點 3: 將 removeLastTarget 修改為 removeTarget(index) ★★★
const removeTarget = (index: number) => {
  // 使用 VeeValidate 的 remove 函式移除指定索引的表單欄位狀態
  remove(index);
  // 同步從我們的自訂錯誤陣列中移除對應的錯誤物件
  targetErrors.splice(index, 1);
};

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
      apiHandler.get("/option/serviceItems"),
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

const onSubmit = handleSubmit(async (values) => {
  // ... 表單驗證部分保持不變 ...
  Object.keys(dynamicErrors).forEach(
    (key: string) => (dynamicErrors[key] = null),
  );
  targetErrors.splice(0, targetErrors.length);
  let isDynamicPartValid = true;

  if (values.serviceMethod === -1 && !otherServicemethods.value.trim()) {
    dynamicErrors.otherServicemethods = "請輸入其他服務方式";
    isDynamicPartValid = false;
  }
  if (values.serviceItemID?.includes(-1) && !otherserviceItem.value.trim()) {
    dynamicErrors.otherserviceItem = "請輸入其他需求";
    isDynamicPartValid = false;
  }
  selectedExtraItems.value.forEach((item: ServiceObjectOption) => {
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

  values.targets?.forEach((target: Target, index: number) => {
    const currentErrors: Partial<Record<keyof Target, string>> = {};
    if (!target.name || !target.name.trim()) {
      currentErrors.name = "名稱為必填";
      isDynamicPartValid = false;
    }
    if (target.gender === null || target.gender === undefined) {
      currentErrors.gender = "性別為必填";
      isDynamicPartValid = false;
    }
    if (target.nationalityID === null || target.nationalityID === undefined) {
      currentErrors.nationalityID = "國籍為必填";
      isDynamicPartValid = false;
    }
    if (
      target.nationalityID === -1 &&
      (!target.nationalityOther || !target.nationalityOther.trim())
    ) {
      currentErrors.nationalityOther = "請輸入其他國籍";
      isDynamicPartValid = false;
    }
    targetErrors[index] = currentErrors;
  });

  if (!isDynamicPartValid || !meta.value.valid) {
    toast.add({
      severity: "warn",
      summary: "表單無效",
      detail: "請檢查所有必填欄位後再提交。",
      life: 3000,
    });
    return;
  }
  // --- 以上驗證邏輯不變 ---

  isSubmitting.value = true;

  const formattedDate = values.filingDate
    ? format(values.filingDate, "yyyy-MM-dd")
    : null;

  // ★★★ 修改點 1: 建立符合新格式的 serviceItemID 陣列 ★★★
  const formattedServiceItems = (values.serviceItemID || []).map(
    (id: number) => {
      // 檢查這個 ID 對應的服務項目是否需要額外資訊 (extra: true)
      const serviceItemDefinition = serviceObjectList.value.find(
        (item) => item.id === id,
      );

      if (serviceItemDefinition && serviceItemDefinition.extra) {
        // 如果需要額外資訊，從 extraInputValues 中取出 unit 和 detail (content)
        const extraData = extraInputValues[id];
        return {
          id: id,
          unit: extraData ? extraData.unit.trim() : "",
          detail: extraData ? extraData.content.trim() : "",
        };
      } else {
        // 如果是簡單項目 (包括 id 為 -1 的 "其他")，只回傳 id
        return { id: id };
      }
    },
  );

  const formattedTargets = (values.targets || []).map((t: Target) => ({
    name: t.name.trim(),
    gender: t.gender,
    nationalityID: t.nationalityID,
    nationalityOther:
      t.nationalityID === -1 && t.nationalityOther
        ? t.nationalityOther.trim()
        : null,
  }));

  // ★★★ 修改點 2: 在 payload 中使用新的 formattedServiceItems 並移除 extraInfo ★★★
  const payload = {
    filingDate: formattedDate,
    caseNumber: values.caseNumber?.trim(),
    targets: formattedTargets,
    serviceMethod: values.serviceMethod,
    serviceMethodOther:
      values.serviceMethod === -1 ? otherServicemethods.value.trim() : null,
    taskObject: values.taskObject?.trim() || null,
    detail: values.detail?.trim() || null,

    serviceItemID: formattedServiceItems, // 使用新的格式

    serviceItemOther: values.serviceItemID?.includes(-1)
      ? otherserviceItem.value.trim()
      : null,
    // extraInfo: extraInfo, // 舊的 extraInfo 欄位不再需要，已整合進 serviceItemID
  };

  try {
    await apiHandler.post(
      `/form/assign/general/${values.caseNumber}/record`,
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
    toast.add({
      severity: "error",
      summary: "提交失敗",
      detail: error.response?.data?.error?.message || "發生未知錯誤",
      life: 5000,
    });
  } finally {
    isSubmitting.value = false;
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
.text-red-500 {
  color: var(--p-red-500);
  margin-left: 0.25rem;
}
</style>
