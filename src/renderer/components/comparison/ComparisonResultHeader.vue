<template>
  <div class="flex items-center gap-6">
    <div class="mr-4 text-lg font-bold">{{ data.project }}</div>
    <div>{{ data.refBranch }} / {{ data.refSetName }}</div>
    <i class="pi pi-arrow-right-arrow-left"></i>
    <div>{{ data.testBranch }} / {{ data.testSetName }}</div>
  </div>
</template>
<script setup lang="ts">
import type { ComparisonSetSummary } from "../../composables/useComparisonResultExplorer";

defineProps<{
  data: ComparisonSetSummary;
}>();
</script>
