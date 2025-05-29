<template>
  <div class="card">
    <DataTable :value="tableBodyData" class="merged-effect-table">
      <!-- 動態生成列 -->
      <Column
        v-for="(header, colIndex) in tableHeaders"
        :key="`col-${colIndex}`"
        :field="`col${colIndex}`"
        :header="header"
      >
        <template #body="slotProps">
          <!-- slotProps.data 是一行處理後的數據 (ProcessedRow) -->
          <!-- colIndex 是當前列的索引 -->
          <div
            v-if="
              slotProps.data.cells[colIndex] &&
              !slotProps.data.cells[colIndex].isMergedUp &&
              !slotProps.data.cells[colIndex].isMergedLeft
            "
            class="cell-content"
            :style="getCellDynamicStyles(slotProps.data.cells[colIndex])"
          >
            {{ slotProps.data.cells[colIndex].displayValue }}
          </div>
          <!-- 如果 isMergedUp 或 isMergedLeft 為 true，此儲存格的內容不顯示 -->
          <!-- PrimeVue 仍會渲染 <td>，但它是空的 -->
        </template>
      </Column>
      <template #empty> 無數據 </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// ----- 類型定義 -----
interface ProcessedCell {
  rawValue: string | number;
  displayValue: string | number;
  isMergedUp: boolean; // 此儲存格是否被其上方的儲存格合併 (因此不可見)
  isMergedLeft: boolean; // 此儲存格是否被其左方的儲存格合併 (因此不可見)
  // 以下屬性用於主儲存格，以輔助 CSS 樣式，但不是真正的 rowspan/colspan
  effectiveRowspan: number; // 如果此儲存格是主儲存格，它向上合併了多少行
  effectiveColspan: number; // 如果此儲存格是主儲存格，它向左合併了多少列
}

interface ProcessedRow {
  cells: ProcessedCell[];
  originalRowIndex: number;
}

// ----- 原始數據 -----
const rawData = ref<Array<Array<string | number>>>([
  ["服務方式", "性別", "欄位A", "欄位B", "欄位C", "其他"],
  ["人數", "男", "1", "2", "3", "4"],
  ["^人數", "女", "1", "2", "3", "4"], // ^人數 與上方的 人數 合併
  ["^人數", "$女", "5", "6", "7", "8"], // $女 與左方的 女 合併, ^人數 與上方的 人數 合併
  ["總人次百分比", "$總人次百分比", "$總人次百分比", "值X"], // 兩個 $ 都與最左邊的合併
  ["新項目", "類別1", "10", "20", "30", "40"],
  ["^新項目", "^類別1", "$^類別1", "$$$^類別1", "50", "60"], // 複雜合併
]);

// ----- 狀態 -----
const processedTableData = ref<ProcessedRow[]>([]);
const tableHeaders = ref<string[]>([]);

// ----- 數據預處理邏輯 -----
const preprocessDataTable = (
  data: Array<Array<string | number>>,
): ProcessedRow[] => {
  if (!data || data.length === 0) return [];

  const numRows = data.length;
  const numCols = data[0]?.length || 0;

  // 1. 初始化帶有原始資訊的處理後數據結構
  const initialProcessed: ProcessedRow[] = data.map((row, rIdx) => ({
    originalRowIndex: rIdx,
    cells: row.map((cellVal) => {
      let displayValue = String(cellVal);
      let mergeUp = false;
      let mergeLeft = false;

      if (typeof cellVal === "string") {
        // 處理 "^$", "$^"
        if (cellVal.startsWith("^$") || cellVal.startsWith("$^")) {
          mergeUp = true;
          mergeLeft = true;
          displayValue = cellVal.substring(2);
        } else if (cellVal.startsWith("^")) {
          mergeUp = true;
          displayValue = cellVal.substring(1);
        } else if (cellVal.startsWith("$")) {
          mergeLeft = true;
          displayValue = cellVal.substring(1);
        }
      }
      return {
        rawValue: cellVal,
        displayValue: displayValue,
        isMergedUp: false, // 稍後根據 mergeUp 標記和上下文確定
        isMergedLeft: false, // 稍後根據 mergeLeft 標記和上下文確定
        effectiveRowspan: 1,
        effectiveColspan: 1,
        _tempMergeUpMark: mergeUp, // 臨時標記
        _tempMergeLeftMark: mergeLeft, // 臨時標記
      };
    }),
  }));

  // 2. 處理 rowspan (基於 _tempMergeUpMark)
  for (let c = 0; c < numCols; c++) {
    for (let r = 1; r < numRows; r++) {
      const currentCell = initialProcessed[r].cells[c];
      if (!currentCell) continue;

      if (currentCell._tempMergeUpMark) {
        // 向上查找第一個可合併的主儲存格
        let masterR = r - 1;
        while (masterR >= 0) {
          const masterCellCandidate = initialProcessed[masterR].cells[c];
          if (
            masterCellCandidate &&
            !masterCellCandidate.isMergedUp &&
            masterCellCandidate.displayValue === currentCell.displayValue
          ) {
            // 找到主儲存格
            masterCellCandidate.effectiveRowspan++;
            currentCell.isMergedUp = true; // 標記此儲存格被向上合併
            break; // 已找到主儲存格
          }
          if (!masterCellCandidate || masterCellCandidate.isMergedUp) {
            masterR--; // 如果上方儲存格本身也是被合併的，繼續向上找
          } else {
            break; // 遇到不同值或不可合併的，停止
          }
        }
      }
    }
  }

  // 3. 處理 colspan (基於 _tempMergeLeftMark)
  for (let r = 0; r < numRows; r++) {
    for (let c = 1; c < numCols; c++) {
      const currentCell = initialProcessed[r].cells[c];
      if (!currentCell) continue;

      if (currentCell._tempMergeLeftMark) {
        // 向左查找第一個可合併的主儲存格
        let masterC = c - 1;
        while (masterC >= 0) {
          const masterCellCandidate = initialProcessed[r].cells[masterC];
          if (
            masterCellCandidate &&
            !masterCellCandidate.isMergedLeft &&
            masterCellCandidate.displayValue === currentCell.displayValue
          ) {
            // 找到主儲存格
            masterCellCandidate.effectiveColspan++;
            currentCell.isMergedLeft = true; // 標記此儲存格被向左合併
            break;
          }
          if (!masterCellCandidate || masterCellCandidate.isMergedLeft) {
            masterC--;
          } else {
            break;
          }
        }
      }
    }
  }
  // 移除臨時標記
  return initialProcessed.map((row) => ({
    ...row,
    cells: row.cells.map((cell) => {
      const { _tempMergeUpMark, _tempMergeLeftMark, ...rest } = cell;
      return rest;
    }),
  })) as ProcessedRow[];
};

// 動態計算儲存格樣式 (主要用於 rowspan 的視覺效果)
const getCellDynamicStyles = (cell: ProcessedCell | undefined) => {
  if (!cell || cell.isMergedUp || cell.isMergedLeft) return {}; // 被合併的儲存格不需要特殊樣式

  const styles: Record<string, string> = {};
  // 嘗試通過 CSS 讓主儲存格在視覺上“佔據”更多空間
  // 注意：這並不能真正改變 <td> 的 rowspan/colspan 屬性
  if (cell.effectiveRowspan > 1) {
    // styles.height = `calc(${cell.effectiveRowspan} * var(--table-row-height, 2.5em))`; // 假設行高
    // styles.display = 'flex';
    // styles.alignItems = 'flex-start'; // 或 center
    // styles.borderBottomWidth = (cell.effectiveRowspan > 1) ? '1px' : '1px'; // 確保底部邊框
  }
  if (cell.effectiveColspan > 1) {
    // colspan 視覺模擬非常困難，因為列寬由 <Column> 控制
    // styles.fontWeight = 'bold';
    // styles.backgroundColor = '#f9f9f9';
  }
  return styles;
};

onMounted(() => {
  if (rawData.value.length > 0 && rawData.value[0]) {
    tableHeaders.value = rawData.value[0].map((headerValue) => {
      let displayHeader = String(headerValue);
      if (typeof headerValue === "string") {
        if (headerValue.startsWith("^$") || headerValue.startsWith("$^"))
          displayHeader = headerValue.substring(2);
        else if (headerValue.startsWith("^"))
          displayHeader = headerValue.substring(1);
        else if (headerValue.startsWith("$"))
          displayHeader = headerValue.substring(1);
      }
      return displayHeader;
    });
    // 移除表頭行，只處理數據行
    const dataRows = rawData.value.slice(1);
    processedTableData.value = preprocessDataTable(dataRows);

    // 如果表頭也需要合併邏輯，則 preprocessDataTable 需要接收整個 rawData
    // 並且 tableHeaders 的生成方式也要調整
    // 目前的實現是表頭不參與合併，數據行從第二行開始
  }
  console.log(
    "Processed Table Data:",
    JSON.parse(JSON.stringify(processedTableData.value)),
  );
  console.log("Table Headers:", tableHeaders.value);
});
</script>

<style scoped>
.card {
  padding: 1rem;
}
/* 使用 :deep 穿透到 DataTable 內部元素 */
:deep(.merged-effect-table .p-datatable-tbody > tr > td) {
  border: 1px solid #dee2e6; /* PrimeVue 預設邊框色 */
  padding: 0.75rem; /* 適當的內邊距 */
  vertical-align: top;
  text-align: left;
  /* 如果一個儲存格是主儲存格且 rowspan > 1，讓其內容填滿 */
}

:deep(.merged-effect-table .p-datatable-thead > tr > th) {
  border: 1px solid #dee2e6;
  padding: 0.75rem;
  background-color: #f8f9fa; /* PrimeVue 預設表頭背景色 */
  text-align: center;
  font-weight: bold;
}

/* 嘗試為 rowspan > 1 的主儲存格添加一些樣式 */
.cell-content {
  display: flex;
  align-items: flex-start; /* 內容頂部對齊 */
  height: 100%; /* 嘗試使其填滿 td 高度 */
}

/*
  為了更好的 rowspan 視覺效果，你可能需要確保所有行具有一致的高度。
  如果一個儲存格的 effectiveRowspan > 1，它下面的那些 isMergedUp=true 的儲存格
  雖然內容為空，但其 <td> 仍然存在。瀏覽器渲染 rowspan 時，
  主 <td> 會覆蓋掉下面被合併的 <td>。
  我們這裡的 CSS 主要是確保邊框看起來是連續的。
  更複雜的 rowspan 高度控制可能需要js計算或更精巧的CSS。
*/
</style>
