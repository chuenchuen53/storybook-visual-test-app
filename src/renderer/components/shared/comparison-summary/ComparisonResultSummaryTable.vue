<template>
  <table>
    <thead>
      <tr>
        <th>Difference</th>
        <th>Added</th>
        <th>Removed</th>
        <th>Same</th>
        <th>Skip</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ data.resultSummary.diff }}</td>
        <td>{{ data.resultSummary.added }}</td>
        <td>{{ data.resultSummary.removed }}</td>
        <td>{{ data.resultSummary.same }}</td>
        <td>{{ data.resultSummary.skip }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { ComparisonSetSummary } from "../../../composables/useComparisonResultExplorer";

defineProps<{
  data: ComparisonSetSummary;
}>();
</script>

<style scoped lang="scss">
th {
  background: var(--p-content-background);
  font-weight: bold;
}

th,
td {
  padding: 8px 16px;
  border: gray;
  border: 1px solid var(--p-content-border-color);
}
</style>
