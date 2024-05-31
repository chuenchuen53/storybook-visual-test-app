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
        <div class="relative size-full">
          <ComparisonSetting v-if="isNullResult" class="basis-full" />
          <div v-else class="mt-4">
            <div class="mx-6 mb-6 flex justify-between">
              <ComparisonResultHeader v-if="comparisonSetSummary" :data="comparisonSetSummary" />
              <IconButton
                v-tooltip.left="'Start new comparison'"
                icon="pi pi-trash"
                :wrapper-size="40"
                :icon-size="16"
                @click="removeCurrentResult"
              />
            </div>
            <ComparisonResultSummaryTable
              v-if="comparisonSetSummary && comparisonImageState.type === null"
              class="mx-6 my-6"
              :data="comparisonSetSummary"
            />
            <ScrollPanel class="scroll-panel-height w-full overflow-hidden">
              <ComparisonImages
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
import IconButton from "../components/general/IconButton.vue";
import ComparisonResultExplorer from "../components/comparison/comparison-result-explorer/ComparisonResultExplorer.vue";
import ComparisonResultSummaryTable from "../components/comparison/ComparisonResultSummaryTable.vue";
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
} = storeToRefs(store);
const { refreshData, openInExplorer, expandAll, collapseAll, handleNodeSelect, removeCurrentResult } = store;

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.scroll-panel-height {
  height: calc(100vh - 130px);
}
</style>
