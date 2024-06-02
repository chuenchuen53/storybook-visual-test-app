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

      <section id="saved-page-screenshot-table-section" class="mb-8">
        <div class="pb-4 text-lg font-semibold">Screenshot</div>
        <RefTestSetTable
          :data="screenshotSetsData"
          @view-set="handleScreenshotViewClick"
          @del-set="handleScreenshotDeleteClick"
          @del-branch="handleDelScreenshotBranch"
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
import RefTestSetTable from "./ScreenshotSetTable.vue";
import ComparisonSavedSet from "./ComparisonSetDataTable.vue";
import type { SavedComparisonInfo, SavedScreenshotSetInfo } from "../../../shared/type";

const store = useSavedSetStore();
const { filteredSavedSets } = storeToRefs(store);
const {
  getAllSavedSets,
  openScreenshotSet,
  openComparisonSet,
  deleteScreenshotSet,
  deleteComparisonSet,
  deleteScreenshotBranch,
  deleteProject,
} = store;

const screenshotSetsData = computed(() => {
  const raw = filteredSavedSets.value?.screenshot;
  return raw ? treeNodesForUi(raw, x => "id" in x) : [];
});

function handleScreenshotViewClick(data: SavedScreenshotSetInfo) {
  openScreenshotSet(data);
}

function handleScreenshotDeleteClick(data: SavedScreenshotSetInfo) {
  deleteScreenshotSet(data);
}

function handleComparisonViewClick(data: SavedComparisonInfo) {
  openComparisonSet(data);
}

function handleComparisonDeleteClick(data: SavedComparisonInfo) {
  deleteComparisonSet(data);
}

function handleDelScreenshotBranch(branch: string) {
  deleteScreenshotBranch(branch);
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
