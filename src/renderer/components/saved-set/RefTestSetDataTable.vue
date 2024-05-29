<template>
  <DataTable :value="rows">
    <template #empty>No saved set.</template>
    <Column field="branch" header="Branch"></Column>
    <Column field="name" header="Name"></Column>
    <Column field="createdAt" header="Created At"></Column>
    <Column field="viewport" header="Viewport">
      <template #body="{ data }">
        <span>{{ data.viewport.width }} x {{ data.viewport.height }}</span>
      </template>
    </Column>
    <Column field="stories" header="Stories">
      <template #body="{ data }">
        <span>{{ data.stories }}</span>
        <span v-if="data.errStories" class="ml-1 text-xs text-[var(--p-button-text-danger-color)]"
          >({{ data.errStories }})</span
        >
      </template>
    </Column>
    <Column field="fileSize" header="Size"></Column>
    <Column field="actions" header="Actions">
      <template #body="{ data }">
        <button @click="handleViewClick(data)">View</button>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import type { RefTestSavedInfo } from "../../../shared/type";

const store = useSavedSetStore();
const { openRefTestSet } = store;

defineProps<{
  rows: RefTestSavedInfo[];
}>();

function handleViewClick(data: RefTestSavedInfo) {
  openRefTestSet(data);
}
</script>
