<template>
  <div>
    <div v-if="userStore.isLoggedIn" class="right-corner">
      {{ userStore.userInfo.getUserfullname() }}
    </div>
    <div>
      <DataTable
        :value="form_data"
        scrollable
        scrollHeight="flex"
        dataKey="caseNumber"
        responsiveLayout="scroll"
        class="p-datatable-sm p-datatable-striped"
      >
        <template #header> </template>

        <Column
          field="caseNumber"
          header="caseNumber"
          :sortable="true"
          style="min-width: 80px"
        >
          <template #body="slotProps">
            <span
              @click="handlecaseNumberClick(slotProps.data)"
              style="
                cursor: pointer;
                color: var(--p-primary-color); /* 使用 PrimeVue 主題色 */
                text-decoration: underline;
                font-weight: bold;
              "
              :title="`查看 caseNumber ${slotProps.data.caseNumber} 的詳細資料`"
            >
              {{ slotProps.data.caseNumber }}
            </span>
          </template>
        </Column>

        <Column
          v-if="shouldShowWorkerColumn"
          field="worker"
          header="工作人員"
          :sortable="true"
        >
          <template #body="slotProps">
            <i class="pi pi-user mr-1" style="vertical-align: middle"></i>
            <span style="vertical-align: middle">{{
              slotProps.data.worker
            }}</span>
          </template>
        </Column>

        <Column
          field="status"
          header="狀態"
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <Chip
              :label="getStatusText(slotProps.data.status)"
              :severity="getStatusSeverity(slotProps.data.status)"
              size="small"
            />
          </template>
        </Column>

        <Column
          field="type"
          header="類別"
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <Chip
              :label="getTypeText(slotProps.data.type)"
              :severity="getTypeSeverity(slotProps.data.type)"
              size="small"
            />
          </template>
        </Column>

        <Column field="date" header="日期" :sortable="true">
          <template #body="slotProps">
            {{ formatDate(slotProps.data.date) }}
          </template>
        </Column>
        <Column header="操作" style="min-width: 100px; text-align: center">
          <template #body="slotProps">
            <Button
              label="開案"
              class="p-button-sm p-button-success"
              @click="handleOpenCase(slotProps.data)"
              :disabled="slotProps.data.status === 1"
              :aria-label="
                '為 caseNumber ' + slotProps.data.caseNumber + ' 開案'
              "
            />
          </template>
        </Column>

        <template #empty> 沒有可顯示的資料。 </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { SaveSession } from "../stores/auth"; // 確認路徑正確
import { useRouter } from "vue-router";
import { apiHandler } from "../class/apiHandler";
// --- PrimeVue 元件導入 ---
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import { userInfo } from "../class/userinfo";
import Button from "primevue/button";
// 移除了 Button, ProgressSpinner, Message, Card, Divider

// --- 狀態變數 ---
const form_data = ref([]);
const testdata = ref([
  // 這裡仍然使用靜態測試數據，如果需要 API 加載，onMounted 中處理
  {
    caseNumber: "9527",
    worker: "worker01",
    status: 2,
    date: "2024-07-23T03:22:15Z",
    type: 1,
  },
  {
    caseNumber: "2",
    worker: "worker02",
    status: 1,
    date: "2024-08-18T19:58:42Z",
    type: 2,
  },
  {
    caseNumber: "3",
    worker: "worker03",
    status: 0,
    date: "2024-08-10T12:45:09Z",
    type: 1,
  },
  {
    caseNumber: "4",
    worker: "worker04",
    status: 3,
    date: "2024-08-02T07:31:36Z",
    type: 2,
  },
  {
    caseNumber: "5",
    worker: "worker05",
    status: 2,
    date: "2024-08-15T00:17:03Z",
    type: 1,
  },
  {
    caseNumber: "6",
    worker: "worker06",
    status: 0,
    date: "2024-07-29T17:03:30Z",
    type: 2,
  },
  {
    caseNumber: "7",
    worker: "worker07",
    status: 1,
    date: "2024-07-25T09:49:57Z",
    type: 1,
  },
  {
    caseNumber: "8",
    worker: "worker08",
    status: 3,
    date: "2024-08-07T02:36:24Z",
    type: 2,
  },
  {
    caseNumber: "9",
    worker: "worker09",
    status: 2,
    date: "2024-08-20T23:22:51Z",
    type: 1,
  },
  {
    caseNumber: "10",
    worker: "worker10",
    status: 0,
    date: "2024-07-31T16:09:18Z",
    type: 2,
  },
]);
const userStore = SaveSession();
const router = useRouter();

// --- 對應關係與格式化 (保持不變) ---
const statusMap: { [key: number]: string } = {
  0: "未開案",
  1: "已開案",
  2: "不開案",
  3: "已結案",
};
const typeMap: { [key: number]: string } = { 1: "一般", 2: "新入境" };

const getStatusText = (status: number): string => statusMap[status] || "未知";
const getTypeText = (type: number): string => typeMap[type] || "未知";

type ChipSeverity =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "secondary"
  | "contrast"
  | null;

const getStatusSeverity = (status: number): ChipSeverity => {
  switch (status) {
    case 0:
      return "secondary";
    case 1:
      return "success";
    case 2:
      return "warning";
    case 3:
      return "contrast";
    default:
      return null;
  }
};
const getTypeSeverity = (type: number): ChipSeverity => {
  switch (type) {
    case 1:
      return "info";
    case 2:
      return "primary";
    default:
      return null;
  }
};
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-");
  } catch (e) {
    console.error("日期格式化錯誤:", e);
    return dateString;
  }
};
const shouldShowWorkerColumn = computed(() => {
  const permission = userStore.userInfo?.permission;

  return typeof permission === "number" && permission <= 10;
});

// --- 修改後的 handleIdClick 方法 (只負責路由跳轉) ---
const handlecaseNumberClick = (item: { caseNumber: string; type: number }) => {
  console.log(
    "列表元件：點擊 caseNumber:",
    item.caseNumber,
    "類型:",
    item.type,
  );

  let typeName = "unknown";
  if (item.type === 1) {
    typeName = "general";
  } else if (item.type === 2) {
    typeName = "arrival";
  }

  if (typeName === "unknown") {
    console.error("handlecaseNumberClick: 未知的記錄類型:", item.type);
    return;
  }

  // 假設你的詳細頁面路由是 /assigns/:type/:caseNumber
  const targetPath = `/assigns/${typeName}/${item.caseNumber}`;
  console.log("列表元件：準備跳轉到:", targetPath);
  router.push(targetPath);

  // 或者使用命名路由 (更推薦，如果已在 router/index.ts 中定義 name)
  // router.push({ name: 'AssignDetail', params: { type: typeName, id: item.id } });
};
const handleOpenCase = (item: {
  caseNumber: string;
  type: number;
  status: number;
}) => {
  console.log(
    "準備為caseNumber:",
    item.caseNumber,
    "類型:",
    item.type,
    "進行開案操作",
  );
  // 在這裡實現你的開案邏輯，例如：
  // 1. 彈出確認對話框 (可以使用 PrimeVue 的 ConfirmDialog)
  // 2. 調用 API 更新案件狀態
  // 3. 更新成功後，可能需要重新加載列表數據或更新該行的狀態
  // 4. 或者跳轉到一個專門的開案表單頁面

  // 簡單示例：
  if (item.status !== 1) {
    // 再次確認不是已開案狀態
    // 假設有一個 API 端點用於開案
    // apiHandler.post(`/cases/${item.id}/open`)
    //   .then(response => {
    //     alert(`ID: ${item.id} 開案成功！`);
    //     // 更新 testdata 中該項的 status (如果 API 不返回更新後的數據)
    //     const index = testdata.value.findIndex(d => d.id === item.id);
    //     if (index !== -1) {
    //       testdata.value[index].status = 1; // 假設 1 代表已開案
    //     }
    //   })
    //   .catch(error => {
    //     console.error("開案失敗:", error);
    //     alert(`ID: ${item.id} 開案失敗，請稍後再試。`);
    //   });
    alert(`模擬為 ID: ${item.caseNumber} 進行開案 (實際應調用API)`);
    // 為了演示，我們直接修改 testdata (實際應用中應該通過 API 更新後端數據)
    const index = form_data.value.findIndex(
      (d) => d.caseNumber === item.caseNumber,
    );
    if (index !== -1) {
      form_data.value[index].status = 1; // 假設 1 代表已開案
    }
  } else {
    alert(`caseNumber: ${item.caseNumber} 已經是開案狀態。`);
  }
};

// --- 生命週期鉤子 ---
onMounted(() => {
  console.log("onMounted");
  apiHandler
    .get("/form/assign")
    .then((response) => {
      form_data.value = response.data;
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<style scoped>
/* 這裡只保留列表可能需要的樣式 */
.right-corner {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
/* 你原有的其他列表樣式 */
.text-grey {
  color: var(--p-text-color-secondary);
}
.font-medium {
  font-weight: 500;
}
.text-sm {
  font-size: 0.875rem;
}
.text-color-secondary {
  color: var(--p-text-color-secondary);
}
.ml-auto {
  margin-left: auto;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-3 {
  margin-top: 0.75rem;
}
.mt-4 {
  margin-top: 1rem;
}
.pa-5 {
  padding: 1.25rem;
}
.text-center {
  text-align: center;
}
</style>
