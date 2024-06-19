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
        <div id="comparison-page-right-panel" class="size-full">
          <ComparisonSetting v-if="isNullResult" class="basis-full" />
          <div v-else class="mt-4">
            <div class="mx-6 mb-6 flex justify-between">
              <ComparisonResultHeader v-if="comparisonSetSummary" :data="comparisonSetSummary" />
              <div id="comparison-page-right-btn-group" class="flex gap-2">
                <IconButton
                  v-if="!(comparisonSetSummary && comparisonImageState.type === null)"
                  v-tooltip.left="'Show summary'"
                  icon="pi pi-info-circle"
                  :wrapper-size="40"
                  :icon-size="16"
                  @click="resetImgs"
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
import { onMounted } from "vue";
import ScrollPanel from "primevue/scrollpanel";
import html2canvas from "html2canvas";
import IconButton from "../components/general/IconButton.vue";
import ComparisonResultExplorer from "../components/shared/comparison-result-explorer/ComparisonResultExplorer.vue";
import ComparisonSummary from "../components/shared/comparison-summary/ComparisonSummary.vue";
import ComparisonSetting from "../components/comparison/ComparisonSetting.vue";
import ComparisonResultHeader from "../components/comparison/ComparisonResultHeader.vue";
import { useComparisonStore } from "../stores/ComparisonStore";
import SaveCompareResultDialog from "../components/comparison/SaveCompareResultDialog.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import ComparisonImages from "../components/comparison/ComparisonImages.vue";

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
  resetImgs,
  handleClickSummaryTitle,
} = store;

const screenshot = () => {
  let clonedElement: HTMLElement | undefined = undefined;
  try {
    const element = document.querySelector("#comparison-page-right-panel") as HTMLElement;
    clonedElement = element.cloneNode(true) as HTMLElement;

    document.body.appendChild(clonedElement);

    clonedElement.style.width = "1920px";
    const scrollPanel = clonedElement.querySelector(".scroll-panel-height") as HTMLElement;
    scrollPanel.style.height = "100%";
    const btnGroup = clonedElement.querySelector("#comparison-page-right-btn-group") as HTMLElement;
    btnGroup.style.display = "none";

    html2canvas(clonedElement).then(canvas => {
      const img = canvas.toDataURL("image/webp");
      const a = document.createElement("a");
      a.href = img;
      a.download = "result.webp";
      a.click();
    });
  } finally {
    if (clonedElement) {
      document.body.removeChild(clonedElement);
    }
  }
};

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.scroll-panel-height {
  height: calc(100vh - 130px);
}
</style>
