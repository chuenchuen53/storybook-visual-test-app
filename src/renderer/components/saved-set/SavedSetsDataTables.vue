<template>
  <div v-if="savedSets">
    <section class="mb-8">
      <div class="my-4 text-lg font-semibold">Comparison</div>
      <ComparisonSavedSet :rows="savedSets.comparison" />
    </section>

    <section class="mb-8">
      <div class="mb-4 text-lg font-semibold">Reference Sets</div>
      <RefTestSetDataTable :rows="savedSets.ref" />
    </section>

    <section class="mb-8">
      <div class="my-4 text-lg font-semibold">Test Sets</div>
      <RefTestSetDataTable :rows="savedSets.test" />
    </section>
  </div>
  <div v-else>todo</div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import RefTestSetDataTable from "./RefTestSetDataTable.vue";
import ComparisonSavedSet from "./ComparisonSetDataTable.vue";

const store = useSavedSetStore();
const { savedSets } = storeToRefs(store);
const { getAllSavedSets } = store;

onMounted(() => {
  getAllSavedSets();
});
</script>
