<template>
  <div class="comparison-data-table-container">
    <DataTable :value="rows" size="small" class="comparison-data-table">
      <template #empty>No saved set.</template>
      <Column :field="fieldName" header="Name"></Column>
      <Column :field="fieldTestBranch" header="Test Branch"></Column>
      <Column :field="fieldRefBranch" header="Ref Branch"></Column>
      <Column :field="fieldCreatedAt" header="Created At">
        <template #body="{ data }">
          <span>{{ createdAtDisplay(data) }}</span>
        </template>
      </Column>
      <Column field="viewport" header="Viewport">
        <template #body="{ data }">
          <span>{{ viewportDisplay(data) }}</span>
        </template>
      </Column>
      <Column header="Change">
        <template #body="{ data }">
          <div>
            <div class="flex flex-nowrap items-center gap-2">
              {{ changeDisplay(data) }}

              <Tooltip>
                <template #trigger>
                  <i class="pi pi-exclamation-circle" />
                </template>
                <template #popover>
                  <div class="grid grid-cols-2 grid-rows-4 gap-x-1">
                    <div>Diff:</div>
                    <div>{{ castData(data).result.diff }}</div>
                    <div>Added:</div>
                    <div>{{ castData(data).result.added }}</div>
                    <div>Removed:</div>
                    <div>{{ castData(data).result.removed }}</div>
                    <div>Same:</div>
                    <div>{{ castData(data).result.same }}</div>
                    <div>Skip:</div>
                    <div>{{ castData(data).result.skip }}</div>
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>
        </template>
      </Column>
      <Column field="actions" header="Actions">
        <template #body="{ data }">
          <div class="flex h-[21px] items-center space-x-2">
            <IconButton
              severity="primary"
              :wrapper-size="28"
              :icon-size="16"
              icon="pi pi-eye"
              @click="$emit('viewSet', data)"
            />
            <IconButton
              severity="danger"
              :wrapper-size="28"
              :icon-size="14"
              icon="pi pi-trash"
              @click="confirmDel($event, data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import dayjs from "dayjs";
import { useConfirm } from "primevue/useconfirm";
import Tooltip from "../general/Tooltip.vue";
import IconButton from "../general/IconButton.vue";
import type { SavedComparisonInfo } from "../../../shared/type";

defineProps<{
  rows: SavedComparisonInfo[];
}>();

const emit = defineEmits<{
  viewSet: [data: SavedComparisonInfo];
  delSet: [data: SavedComparisonInfo];
}>();

const confirm = useConfirm();

const confirmDel = (event: Event, data: SavedComparisonInfo) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Do you want to delete this set?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => {
      emit("delSet", data);
    },
    reject: () => {},
  });
};

function viewportDisplay(x?: SavedComparisonInfo) {
  return x ? `${x.viewport.width}x${x.viewport.height}` : "";
}

function createdAtDisplay(x?: SavedComparisonInfo) {
  return x ? dayjs(x.createdAt).format("DD/MM/YYYY HH:mm") : "";
}

function changeDisplay(x?: SavedComparisonInfo) {
  return x ? (x.result.diff + x.result.added + x.result.removed).toString() : "";
}

const fieldName: keyof SavedComparisonInfo = "name";
const fieldTestBranch: keyof SavedComparisonInfo = "testBranch";
const fieldRefBranch: keyof SavedComparisonInfo = "refBranch";
const fieldCreatedAt: keyof SavedComparisonInfo = "createdAt";
const castData = (x: unknown): SavedComparisonInfo => x as SavedComparisonInfo;
</script>

<style>
.comparison-data-table-container {
  background: var(--p-content-background);
  padding: 8px 12px 16px;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  border-color: var(--p-surface-200);
}

.dark {
  .comparison-data-table-container {
    border-color: transparent;
  }
}

.comparison-data-table {
  border-radius: 10px;

  .p-datatable-thead > tr > th {
    font-size: 14px !important;
    padding: 10px 8px !important;
  }

  .p-datatable-tbody > tr > td {
    font-size: 14px !important;
    padding: 5px 8px 6px !important;
  }
}
</style>
