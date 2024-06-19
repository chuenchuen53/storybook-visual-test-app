<template>
  <div id="comparison-summary">
    <ComparisonResultSummaryTable :data="data" class="mb-8" />
    <ComparisonSummaryImgs
      :diff="diff"
      :added="added"
      :removed="removed"
      @click-title="(type, id) => $emit('clickTitle', type, id)"
    />
  </div>
</template>

<script setup lang="ts">
import ComparisonResultSummaryTable from "./ComparisonResultSummaryTable.vue";
import ComparisonSummaryImgs from "./ComparisonSummaryImgs.vue";
import type { StoriesDiffResult } from "../../../../shared/type";
import type { ComparisonSummaryImgsProps } from "./type";
import type { ComparisonSetSummary } from "../../../composables/useComparisonResultExplorer";

type Props = ComparisonSummaryImgsProps & {
  data: ComparisonSetSummary;
};

defineProps<Props>();

defineEmits<{
  clickTitle: [type: keyof StoriesDiffResult, id: string];
}>();
</script>
