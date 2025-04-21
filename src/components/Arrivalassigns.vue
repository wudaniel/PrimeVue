<template>
  <!-- 使用 PrimeFlex 的 class 會更簡潔 -->
  <div class="surface-card p-4 shadow-2 border-round">
    <h3 class="text-center mb-4">新入境派案表</h3>
    <form @submit.prevent="handleSubmit">
      <div class="grid formgrid">
        <div class="field col-12 md:col-6">
          <label>填表日期:</label>
          <Calendar
            id="filingDate"
            v-model="filingDate"
            dateFormat="yy-mm-dd"
            showIcon
            placeholder="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <div class="field col-12 md:col-6">
          <label for="caseNumber">案號:</label>
          <InputText id="caseNumber" v-model="caseNumber" class="w-full" />
        </div>

        <div class="field col-12 md:col-6">
          <label for="fullName">全名:</label>
          <InputText id="fullName" v-model="FullName" class="w-full" />
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
          />
        </div>

        <!-- 如果仍然需要 "其他" 選項 -->
        <div class="field col-12 md:col-6" v-if="selectednationalities === -1">
          {/* 假設 "其他" 的 ID 是 -1 */}
          <label for="othernationalities">請輸入其他國籍:</label>
          <InputText
            id="othernationalities"
            v-model="othernationalities"
            class="w-full"
          />
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
        </div>

        <div class="field col-12 md:col-6">
          <label>鄉鎮市區</label>
          <SelectButton
            v-model="selectedtown"
            :options="town_List"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="field col-12 md:col-6" v-if="selectedtown === -1">
          <label for="othertown">請輸入其他鄉鎮市區:</label>
          <InputText id="othertown" v-model="othertown" class="w-full" />
        </div>

        <div class="field col-12 md:col-6">
          <label>主責社工</label>
          <SelectButton
            v-model="selectedworkers"
            :options="workers_List"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="field col-12 flex justify-content-end">
          <Button type="submit" label="提交" icon="pi pi-check" />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { watch, ref, onMounted } from "vue";
import { apiHandler } from "../class/apiHandler";
import { format } from "date-fns";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext"; // 你也用了 InputText
import SelectButton from "primevue/selectbutton"; // 你也用了 SelectButton
import RadioButton from "primevue/radiobutton"; // 你也用了 RadioButton
import Button from "primevue/button"; // 你也用了 Button
import Dropdown from "primevue/dropdown"; // <--- 導入 Dropdown
import Select from "primevue/select";
export default {
  components: {
    Dropdown,
    Select,
    Calendar,
    InputText,
    SelectButton,
    RadioButton,
    Button,
  },
  setup() {
    const filingDate = ref(null); // 顯式類型

    const caseNumber = ref("");
    const FullName = ref("");
    const Nationality_List = ref([]);
    const town_List = ref([]);
    const workers_List = ref([]);
    const selectedGender = ref();
    const selectednationalities = ref();
    const selectedtown = ref();
    const selectedworkers = ref();
    const othernationalities = ref("");
    const othertown = ref("");

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

    const handleSubmit = () => {
      //console.log("--- handleSubmit ---");
      //console.log("步驟 1: 進入 handleSubmit，filingDate.value 是:",filingDate.value,);
      //console.log("步驟 1: filingDate.value 的類型:", typeof filingDate.value);

      // --- 格式化日期 ---
      let formattedDate = null;
      // 進行更安全的檢查
      if (
        filingDate.value &&
        filingDate.value instanceof Date &&
        !isNaN(filingDate.value.getTime())
      ) {
        //console.log("步驟 2: 準備格式化有效的 Date 物件");
        try {
          formattedDate = format(filingDate.value, "yyyy-MM-dd"); // 使用 date-fns
          // formattedDate = dayjs(filingDate.value).format('YYYY-MM-DD'); // 或者使用 dayjs
          //console.log("步驟 3: 格式化後的日期 (formattedDate):", formattedDate);
        } catch (e) {
          //console.error("日期格式化錯誤:", e);
          formattedDate = null; // 出錯時確保是 null
        }
      } else {
        //console.log("步驟 2: filingDate 不是有效的 Date 物件，將使用 null");
        formattedDate = null; // 如果不是 Date (可能是 null 或其他無效值)，直接設為 null
      }
      //console.log("步驟 4: 最終 formattedDate 的值:", formattedDate);
      //console.log("步驟 4: formattedDate 的類型:", typeof formattedDate);

      apiHandler
        .post("/form/assign/arrival", {
          filingDate: formattedDate,
          caseNumber: caseNumber.value,
          fullName: FullName.value,
          nationalityID: selectednationalities.value,
          nationalityOther: othernationalities.value,
          gender: selectedGender.value,
          town: selectedtown.value,
          townOther: othertown.value,
          worker: selectedworkers.value,
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    return {
      handleSubmit,
      filingDate,
      caseNumber,
      FullName,
      Nationality_List,
      town_List,
      workers_List,
      selectedGender,
      selectednationalities,
      selectedtown,
      selectedworkers,
      othernationalities,
      othertown,
    };
  },
};
</script>

<style scoped>
.p-fluid {
  padding: 20px;
}

.p-field {
  margin-bottom: 20px;
}
</style>
