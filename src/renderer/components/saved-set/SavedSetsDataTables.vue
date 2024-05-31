<template>
  <ScrollPanel v-if="filteredSavedSets" class="scroll-panel-height">
    <div class="px-6">
      <section id="saved-page-comparison-table-section" class="mb-8">
        <div class="py-4 text-lg font-semibold">Comparison</div>
        <ComparisonSavedSet
          :rows="filteredSavedSets.comparison"
          @view-set="handleComparisonViewClick"
          @del-set="handleComparisonDeleteClick"
        />
      </section>

      <section id="saved-page-ref-table-section" class="mb-8">
        <div class="pb-4 text-lg font-semibold">Reference Sets</div>
        <RefTestSetTable
          :data="refSetsData"
          @view-set="handleRefTestViewClick"
          @del-set="handleRefTestDeleteClick"
          @del-branch="handleDelRefBranch"
        />
      </section>

      <section id="saved-page-test-table-section" class="mb-8">
        <div class="py-4 text-lg font-semibold">Test Sets</div>
        <RefTestSetTable
          :data="testSetsData"
          @view-set="handleRefTestViewClick"
          @del-set="handleRefTestDeleteClick"
          @del-branch="handleDelTestBranch"
        />
      </section>
    </div>
  </ScrollPanel>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import { treeNodesForUi } from "../general/tree/tree-helper";
import RefTestSetTable from "./RefTestSetTable.vue";
import ComparisonSavedSet from "./ComparisonSetDataTable.vue";
import type { ComparisonSavedInfo, RefTestSavedInfo } from "../../../shared/type";

const store = useSavedSetStore();
const { filteredSavedSets } = storeToRefs(store);
const {
  getAllSavedSets,
  openRefTestSet,
  openComparisonSet,
  deleteRefTestSet,
  deleteComparisonSet,
  deleteRefTestBranch,
  deleteProject,
} = store;

const refSetsData = computed(() => {
  const raw = filteredSavedSets.value?.ref;
  return raw ? treeNodesForUi(raw, x => "id" in x) : [];
});

const testSetsData = computed(() => {
  const raw = filteredSavedSets.value?.test;
  return raw ? treeNodesForUi(raw, x => "id" in x) : [];
});

function handleRefTestViewClick(data: RefTestSavedInfo) {
  openRefTestSet(data);
}

function handleRefTestDeleteClick(data: RefTestSavedInfo) {
  deleteRefTestSet(data);
}

function handleComparisonViewClick(data: ComparisonSavedInfo) {
  openComparisonSet(data);
}

function handleComparisonDeleteClick(data: ComparisonSavedInfo) {
  deleteComparisonSet(data);
}

function handleDelRefBranch(branch: string) {
  deleteRefTestBranch("reference", branch);
}

function handleDelTestBranch(branch: string) {
  deleteRefTestBranch("test", branch);
}

onMounted(() => {
  getAllSavedSets();
});
</script>

<style lang="scss" scoped>
.scroll-panel-height {
  height: calc(100vh - 151px);
}
</style>
