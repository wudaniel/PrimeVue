<template>
  <div>
    <h1>{{ pageTitle }}</h1>

    <!-- 在這裡，你可以使用 v-if 來顯示不同的表單元件 -->
    <OpenCaseForm v-if="operation === 'open'" :case-id="id" :case-type="type" />
    <RefuseCaseForm
      v-if="operation === 'refuse'"
      :case-id="id"
      :case-type="type"
    />
    <CloseCaseForm
      v-if="operation === 'close'"
      :case-id="id"
      :case-type="type"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";

// 透過 defineProps 接收路由傳來的參數
const props = defineProps<{
  type: string;
  id: string;
  operation: "open" | "refuse" | "close";
}>();

// 根據 operation 顯示不同的標題
const pageTitle = computed(() => {
  if (props.operation === "open") {
    return `案件開案 (案號: ${props.id})`;
  }
  if (props.operation === "refuse") {
    return `案件不開案 (案號: ${props.id})`;
  }
  if (props.operation === "close") {
    return `案件結案 (案號: ${props.id})`;
  }
  return "未知的操作";
});
</script>
