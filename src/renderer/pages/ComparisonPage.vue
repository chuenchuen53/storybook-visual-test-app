<template>
  <main class="size-full">
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <ComparisonResultExplorer
          v-model:expanded-keys="expandedKeys"
          v-model:highlight-key="highlightKey"
          v-model:selected-type="selectedType"
          v-model:search-text="searchText"
          :tree-data="treeData"
          :open-in-explorer="openInExplorer"
          :show-save="!isNullResult"
          :expand-all="expandAll"
          :collapse-all="collapseAll"
          :type-options="typeOptions"
          :handle-select-story="handleNodeSelect"
          :open-save-dialog="() => (saveDialogOpen = true)"
        />
      </template>
      <template #right>
        <div class="size-full">
          <ComparisonSetting v-if="isNullResult" class="basis-full" />
          <div v-else class="mt-4">
            <div class="mx-6 mb-6 flex items-center justify-between">
              <ComparisonResultHeader
                v-if="comparisonSetSummary"
                id="comparison-page-header"
                :data="comparisonSetSummary"
              />
              <div class="flex gap-2">
                <IconButton
                  v-if="!(comparisonSetSummary && comparisonImageState.type === null)"
                  v-tooltip.left="'Show summary'"
                  icon="pi pi-info-circle"
                  :wrapper-size="40"
                  :icon-size="16"
                  @click="showComparisonSummary"
                />
                <IconButton
                  v-else
                  v-tooltip.left="'Save as image'"
                  icon="pi pi-image"
                  :wrapper-size="40"
                  :icon-size="16"
                  @click="screenshot"
                />
                <IconButton
                  v-tooltip.left="'Start new comparison'"
                  icon="pi pi-trash"
                  :wrapper-size="40"
                  :icon-size="16"
                  @click="removeCurrentResult"
                />
              </div>
            </div>
            <ScrollPanel class="scroll-panel-height w-full overflow-hidden">
              <ComparisonSummary
                v-if="comparisonSetSummary && comparisonImageState.type === null"
                id="comparison-page-summary"
                class="p-6"
                :data="comparisonSetSummary"
                :diff="comparisonSetSummaryImgs.diff"
                :added="comparisonSetSummaryImgs.added"
                :removed="comparisonSetSummaryImgs.removed"
                @click-title="handleClickSummaryTitle"
              />
              <ComparisonImages
                v-else
                class="mx-6"
                :comparison-image-state="comparisonImageState"
                :diff-view-in-vertical="diffViewInVertical"
                :show-diff-img="showDiffImg"
                @change-show-diff-img="showDiffImg = $event"
                @change-diff-view-in-vertical="diffViewInVertical = $event"
              />
              <div class="h-6"></div>
            </ScrollPanel>
          </div>
        </div>
      </template>
    </LeftRightSplitContainer>
  </main>
  <SaveCompareResultDialog />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import IconButton from "../components/general/IconButton.vue";
import ComparisonResultExplorer from "../components/shared/comparison-result-explorer/ComparisonResultExplorer.vue";
import ComparisonSummary from "../components/shared/comparison-summary/ComparisonSummary.vue";
import ComparisonSetting from "../components/comparison/ComparisonSetting.vue";
import ComparisonResultHeader from "../components/comparison/ComparisonResultHeader.vue";
import { useComparisonStore } from "../stores/ComparisonStore";
import SaveCompareResultDialog from "../components/comparison/SaveCompareResultDialog.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import ComparisonImages from "../components/comparison/ComparisonImages.vue";
import { screenshotComparisonResult } from "../utils/screenshot-comparison-result";

const store = useComparisonStore();
const {
  treeData,
  highlightKey,
  expandedKeys,
  saveDialogOpen,
  searchText,
  typeOptions,
  selectedType,
  isNullResult,
  comparisonSetSummary,
  comparisonImageState,
  showDiffImg,
  diffViewInVertical,
  comparisonSetSummaryImgs,
} = storeToRefs(store);
const {
  refreshData,
  openInExplorer,
  expandAll,
  collapseAll,
  handleNodeSelect,
  removeCurrentResult,
  selectPrevStory,
  selectNextStory,
  showComparisonSummary,
  handleClickSummaryTitle,
} = store;

const screenshot = () => {
  let headerNode: HTMLDivElement = document.querySelector("#comparison-page-header") as unknown as HTMLDivElement;
  let summaryNode: HTMLDivElement = document.querySelector("#comparison-page-summary") as unknown as HTMLDivElement;
  headerNode = headerNode.cloneNode(true) as unknown as HTMLDivElement;
  summaryNode = summaryNode.cloneNode(true) as unknown as HTMLDivElement;
  headerNode.style.margin = "0 24px";
  screenshotComparisonResult(headerNode, summaryNode);
};

const handleShortcut = (e: KeyboardEvent) => {
  if (e.key === "ArrowLeft" && e.altKey) {
    selectPrevStory();
  } else if (e.key === "ArrowRight" && e.altKey) {
    selectNextStory();
  }
};

onMounted(() => {
  refreshData();
  window.addEventListener("keydown", handleShortcut);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleShortcut);
});
</script>

<style scoped>
.scroll-panel-height {
  height: calc(100vh - 130px);
}
</style>
