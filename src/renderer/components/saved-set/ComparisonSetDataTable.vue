<template>
  <DataTable :value="rows">
    <template #empty>No saved set.</template>
    <Column field="testBranch" header="Test Branch"></Column>
    <Column field="refBranch" header="Ref Branch"></Column>
    <Column field="name" header="Name"></Column>
    <Column field="createdAt" header="Created At"></Column>
    <Column field="viewport" header="Viewport">
      <template #body="{ data }">
        <span>{{ data.viewport.width }} x {{ data.viewport.height }}</span>
      </template>
    </Column>
    <Column header="Result">
      <template #body="{ data }">
        <div class="grid grid-cols-2 grid-rows-4 gap-x-2">
          <div>Diff:</div>
          <div>{{ data.result.diff }}</div>
          <div>Added:</div>
          <div>{{ data.result.added }}</div>
          <div>Removed:</div>
          <div>{{ data.result.removed }}</div>
          <div>Same:</div>
          <div>{{ data.result.same }}</div>
        </div>
      </template>
    </Column>
    <Column field="actions" header="Actions">
      <template #body="{ data }">
        <button @click="console.log(data)">View</button>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { ComparisonSavedInfo } from "../../../shared/type";

defineProps<{
  rows: ComparisonSavedInfo[];
}>();
</script>
