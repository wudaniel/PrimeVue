<template>
  <div class="card">
    <DataTable :value="processedData">
      <!-- 動態生成列 -->
      <Column
        v-for="(header, colIndex) in headers"
        :key="`col-${colIndex}`"
        :field="`col${colIndex}`"
        :header="header"
      >
        <template #body="slotProps">
          <!--
            slotProps.data 是一行預處理後的數據, 例如:
            {
              originalRowIndex: 0,
              cells: [
                { value: '服務方式', displayValue: '服務方式', rowspan: 1, colspan: 1, visible: true, isHeader: true },
                { value: '性別', displayValue: '性別', rowspan: 1, colspan: 1, visible: true, isHeader: true },
                // ...
              ]
            }
            slotProps.column.field 是 'col0', 'col1', ...
            slotProps.index 是當前行的索引 (在 processedData 中的索引)
          -->
          <div v-if="getCell(slotProps.data, colIndex)?.visible">
            <span :style="getCellStyle(slotProps.data, colIndex)">
              {{ getCell(slotProps.data, colIndex)?.displayValue }}
            </span>
          </div>
          <!-- 如果 !visible，則不渲染任何內容，由其 rowspan 的主單元格佔據空間 -->
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

// ----- 類型定義 -----
interface CellData {
  value: string | number; // 原始值
  displayValue: string | number; // 清理掉 ^ $ 後的顯示值
  rowspan: number;
  colspan: number; // 雖然我們主要模擬 rowspan，但先計算出來
  visible: boolean; // 此單元格是否可見 (因 rowspan 或 colspan 而隱藏)
  isHeader?: boolean; // 標記是否為表頭行（用於樣式）
  originalColIndex?: number; // 在原始二維陣列中的列索引
  originalRowIndex?: number; // 在原始二維陣列中的行索引
}

interface ProcessedRow {
  originalRowIndex: number; // 原始數據中的行索引，方便調試
  cells: CellData[];
}

// ----- 原始數據 -----
const rawData = ref<Array<Array<string | number>>>([
  ["服務方式", "性別", "...", "其他"],
  ["人數", "男", "1", "2", "3", "4"],
  ["^人數", "女", "1", "2", "3", "4"], // ^人數 與上方的 人數 合併 (rowspan)
  ["總人次百分比", "$總人次百分比"], // $總人次百分比 與左方的 總人次百分比 合併 (colspan)
  ["其他數據", "值A", "值B", "值C", "值D"],
  ["^其他數據", "^值A", "$^值A", "值E", "值F"], // 複雜合併示例
]);

// ----- 狀態 -----
const processedData = ref<ProcessedRow[]>([]);
const headers = ref<string[]>([]);

// ----- 輔助函數 -----
// 獲取單元格數據，處理可能的越界
const getCell = (
  rowData: ProcessedRow,
  colIndex: number,
): CellData | undefined => {
  return rowData.cells[colIndex];
};

// 獲取單元格樣式 (可以根據 isHeader 等添加樣式)
const getCellStyle = (rowData: ProcessedRow, colIndex: number) => {
  const cell = getCell(rowData, colIndex);
  if (cell?.isHeader) {
    return { fontWeight: "bold" };
  }
  return {};
};

// ----- 數據預處理邏輯 -----
const preprocessData = (
  data: Array<Array<string | number>>,
): ProcessedRow[] => {
  if (!data || data.length === 0) {
    console.log("preprocessData: Input data is empty or null.");
    return [];
  }

  let maxCols = 0;
  data.forEach((row) => {
    if (row && row.length > maxCols) {
      maxCols = row.length;
    }
  });

  if (maxCols === 0) {
    // 如果所有行都是空的或不存在
    console.log("preprocessData: No columns found in data.");
    if (
      data.length > 0 &&
      (data[0] === undefined ||
        (Array.isArray(data[0]) && data[0].length === 0))
    ) {
      // 處理 data = [undefined] 或 data = [[]] 的情況
      return data.map((_, rIndex) => ({
        // 為每一行創建空的 cells
        originalRowIndex: rIndex,
        cells: [],
      }));
    }
    return [];
  }

  const numRows = data.length;
  const numCols = maxCols;
  console.log(`preprocessData: Processing ${numRows} rows, ${numCols} cols.`);

  // 1. 初始化 tempProcessed
  const tempProcessed: ProcessedRow[] = data.map((row, rIndex) => {
    const currentCells: CellData[] = [];
    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      // 確保 row 存在才嘗試訪問 row[cIdx]
      const cellValue =
        row && row[cIdx] !== undefined && row[cIdx] !== null ? row[cIdx] : "";
      let displayVal = cellValue;
      if (typeof cellValue === "string") {
        displayVal = cellValue.replace(/[\^\$]/g, "");
      }
      currentCells.push({
        value: cellValue,
        displayValue: displayVal,
        rowspan: 1,
        colspan: 1,
        visible: true,
        isHeader: rIndex === 0,
        originalColIndex: cIdx,
        originalRowIndex: rIndex,
      });
    }
    return {
      originalRowIndex: rIndex,
      cells: currentCells,
    };
  });
  console.log(
    "preprocessData: Initial tempProcessed created:",
    JSON.parse(JSON.stringify(tempProcessed)),
  ); // 深拷貝打印，避免後續修改影響日誌

  // 2. 處理 '^' (rowspan)
  console.log("preprocessData: Starting rowspan processing.");
  for (let c = 0; c < numCols; c++) {
    for (let r = 1; r < numRows; r++) {
      // **極其重要的檢查點：確保 tempProcessed[r], tempProcessed[r].cells, 和 tempProcessed[r].cells[c] 都存在**
      if (
        !tempProcessed[r] ||
        !tempProcessed[r].cells ||
        !tempProcessed[r].cells[c]
      ) {
        console.warn(
          `preprocessData (rowspan): Skipping undefined cell at r=${r}, c=${c}.`,
        );
        continue; // 跳過這個無效的單元格
      }

      const currentCellData = tempProcessed[r].cells[c]; // <-- 如果這裡仍然報錯，說明上面的 if 判斷有問題

      // **在訪問 .value 之前，再次確認 currentCellData 不是 undefined**
      if (currentCellData === undefined) {
        console.error(
          `preprocessData (rowspan): currentCellData is undefined at r=${r}, c=${c}. This should not happen after checks.`,
        );
        continue;
      }

      const cellValue = currentCellData.value; // <-- 錯誤指向這裡
      console.log(
        `preprocessData (rowspan): r=${r}, c=${c}, cellValue="${cellValue}"`,
      );

      if (typeof cellValue === "string" && cellValue.startsWith("^")) {
        let masterCell = null;
        for (let prev_r = r - 1; prev_r >= 0; prev_r--) {
          if (
            tempProcessed[prev_r] &&
            tempProcessed[prev_r].cells &&
            tempProcessed[prev_r].cells[c]
          ) {
            const potentialMasterCell = tempProcessed[prev_r].cells[c];
            if (
              potentialMasterCell.visible &&
              potentialMasterCell.displayValue === currentCellData.displayValue
            ) {
              masterCell = potentialMasterCell;
              break;
            }
            if (potentialMasterCell.visible) break;
          } else {
            console.warn(
              `preprocessData (rowspan): Master cell check failed at prev_r=${prev_r}, c=${c}`,
            );
          }
        }

        if (masterCell) {
          masterCell.rowspan++;
          currentCellData.visible = false;
          console.log(
            `preprocessData (rowspan): Merged r=${r},c=${c} into master. Master rowspan is now ${masterCell.rowspan}`,
          );
        } else {
          console.log(
            `preprocessData (rowspan): No master found for r=${r},c=${c}`,
          );
        }
      }
    }
  }
  console.log("preprocessData: Finished rowspan processing.");

  // 3. 處理 '$' (colspan)
  console.log("preprocessData: Starting colspan processing.");
  for (let r = 0; r < numRows; r++) {
    for (let c = 1; c < numCols; c++) {
      if (
        !tempProcessed[r] ||
        !tempProcessed[r].cells ||
        !tempProcessed[r].cells[c]
      ) {
        console.warn(
          `preprocessData (colspan): Skipping undefined cell at r=${r}, c=${c}.`,
        );
        continue;
      }

      const currentCellData = tempProcessed[r].cells[c];

      if (currentCellData === undefined) {
        console.error(
          `preprocessData (colspan): currentCellData is undefined at r=${r}, c=${c}. This should not happen after checks.`,
        );
        continue;
      }

      const cellValue = currentCellData.value; // <-- 錯誤也可能指向這裡
      console.log(
        `preprocessData (colspan): r=${r}, c=${c}, cellValue="${cellValue}"`,
      );

      if (typeof cellValue === "string" && cellValue.startsWith("$")) {
        let masterCell = null;
        for (let prev_c = c - 1; prev_c >= 0; prev_c--) {
          if (
            tempProcessed[r] &&
            tempProcessed[r].cells &&
            tempProcessed[r].cells[prev_c]
          ) {
            const potentialMasterCell = tempProcessed[r].cells[prev_c];
            if (
              potentialMasterCell.visible &&
              potentialMasterCell.displayValue === currentCellData.displayValue
            ) {
              masterCell = potentialMasterCell;
              break;
            }
            if (potentialMasterCell.visible) break;
          } else {
            console.warn(
              `preprocessData (colspan): Master cell check failed at r=${r}, prev_c=${prev_c}`,
            );
          }
        }

        if (masterCell) {
          masterCell.colspan++;
          currentCellData.visible = false;
          console.log(
            `preprocessData (colspan): Merged r=${r},c=${c} into master. Master colspan is now ${masterCell.colspan}`,
          );
        } else {
          console.log(
            `preprocessData (colspan): No master found for r=${r},c=${c}`,
          );
        }
      }
    }
  }
  console.log("preprocessData: Finished colspan processing.");
  console.log(
    "preprocessData: Final processedData:",
    JSON.parse(JSON.stringify(tempProcessed)),
  );
  return tempProcessed;
};

// ----- 生命週期 -----
onMounted(() => {
  // 假設第一行是表頭
  if (rawData.value.length > 0) {
    headers.value = rawData.value[0].map((headerValue) => {
      if (typeof headerValue === "string") {
        return headerValue.replace(/[\^\$]/g, ""); // 清理表頭文字
      }
      return String(headerValue);
    });
  }
  processedData.value = preprocessData(rawData.value);
  console.log("Processed Data:", processedData.value);
});
</script>

<style scoped>
.card {
  padding: 1rem;
}
/* 可以添加一些基本樣式讓表格更清晰 */
:deep(td) {
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  vertical-align: top; /* 確保 rowspan 的內容垂直對齊 */
}
:deep(th) {
  border: 1px solid #e0e0e0;
  padding: 0.5rem;
  background-color: #f5f5f5;
}
/* 如果一個單元格被標記為不可見，它不應該佔據空間，
   但由於 DataTable 仍然會為每一列的每個數據行創建一個 td 框架 (即使內容為空)，
   我們這裡的 v-if 只是控制了內容的顯示。
   要實現真正的 rowspan/colspan 視覺效果，CSS 會比較複雜。
   一種可能的 CSS 技巧是給 :visible 為 true 的 td 設置 border，
   並調整其 padding 或 line-height 來模擬佔據多行。
*/
</style>
