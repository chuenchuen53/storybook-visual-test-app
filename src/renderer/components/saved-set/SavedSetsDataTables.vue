<template>
  <ScrollPanel v-if="filteredSavedSets" class="scroll-panel-height">
    <div class="max-w-screen-2xl px-6">
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
import { computed } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import { treeNodesForUi } from "../general/tree/tree-helper";
import RefTestSetTable from "./ScreenshotSetTable.vue";
import ComparisonSavedSet from "./ComparisonSetDataTable.vue";
import type { TreeObj } from "../shared/story-explorer/helper";
import type { LeafNodePredicate } from "../general/tree/tree-helper";
import type { SavedComparisonInfo, SavedScreenshotSetInfo } from "../../../shared/type";

const store = useSavedSetStore();
const { filteredSavedSets } = storeToRefs(store);
const { openScreenshotSet, openComparisonSet, deleteScreenshotSet, deleteComparisonSet, deleteScreenshotBranch } =
  store;

const isLeaf: LeafNodePredicate<SavedScreenshotSetInfo> = (
  x: SavedScreenshotSetInfo | TreeObj<SavedScreenshotSetInfo>,
): x is SavedScreenshotSetInfo => {
  const keys = Object.keys(x);
  const requiredKeys: (keyof SavedScreenshotSetInfo)[] = ["id", "createdAt", "project", "branch"];
  return requiredKeys.every(key => keys.includes(key));
};

const screenshotSetsData = computed(() => {
  const raw = filteredSavedSets.value?.screenshot;
  return raw ? treeNodesForUi(raw, isLeaf) : [];
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
</script>

<style lang="scss" scoped>
.scroll-panel-height {
  height: calc(100vh - 151px);
}
</style>
