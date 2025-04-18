<template>
  <div class="p-fluid">
    <h3>新入境派案表</h3>
    <form @submit.prevent="handleSubmit">
      <div class="p-field">
        <label for="filingDate">填表日期:</label>
        <Calendar id="filingDate" v-model="filingDate" />
      </div>
      <div class="p-field">
        <label for="caseNumber">案號:</label>
        <InputText id="caseNumber" v-model="caseNumber" />
      </div>
      <div class="p-field">
        <label for="fullName">全名:</label>
        <InputText id="fullName" v-model="FullName" />
      </div>
      <div class="p-field">
        <label>原母國籍</label>
        <SelectButton
          v-model="selectednationalities"
          :options="Nationality_List"
        />
      </div>
      <div class="p-field" v-if="selectednationalities === -1">
        <label for="othernationalities">請輸入其他國籍:</label>
        <InputText id="othernationalities" v-model="othernationalities" />
      </div>
      <div class="p-field">
        <label>性別:</label>
        <RadioButton v-model="selectedGender" :options="[0, 1, 2]" />
      </div>
      <div class="p-field">
        <label>鄉鎮市區</label>
        <SelectButton v-model="selectedtown" :options="town_List" />
      </div>
      <div class="p-field" v-if="selectedtown === -1">
        <label for="othertown">請輸入其他鄉鎮市區:</label>
        <InputText id="othertown" v-model="othertown" />
      </div>
      <div class="p-field">
        <label>主責社工</label>
        <SelectButton v-model="selectedworkers" :options="workers_List" />
      </div>
      <div class="p-field">
        <Button type="submit" label="提交" />
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { apiHandler } from "../class/apiHandler";

export default {
  setup() {
    const filingDate = ref("");
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
      apiHandler
        .post("/form/assign/arrival", {
          filingDate: filingDate.value,
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
