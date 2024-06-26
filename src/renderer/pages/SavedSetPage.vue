<template>
  <main>
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <Menu
          v-if="currentSelectedSet === null"
          :model="items"
          :pt="{ root: { style: { border: 'none', background: 'transparent' } } }"
          class="px-2 pt-2"
        />
        <div v-if="currentSelectedSet?.type === 'screenshot'">
          <StoryTreeExplorer
            v-model:expanded-keys="screenshotExpandedKeys"
            v-model:highlight-key="screenshotHighlightKey"
            v-model:story-type-filter="screenshotStoryTypeFilter"
            v-model:search-text="screenshotSearchText"
            :tree-data="screenshotTreeData"
            :show-save="false"
            :open-in-explorer="openScreenshotSetInExplorer"
            :expand-all="screenshotExpandAll"
            :collapse-all="screenshotCollapseAll"
            :handle-select-story="handleSelectScreenshotStory"
          >
            <template #story-display="slotProps">
              <div class="flex gap-2">
                <i class="pi pi-bookmark !text-sm text-primary"></i>
                <div>
                  {{ slotProps.label }}
                </div>
                <i v-if="slotProps.data.storyErr" class="pi pi-exclamation-triangle !text-s text-red-400"></i>
              </div>
            </template>
          </StoryTreeExplorer>
        </div>
        <div v-if="currentSelectedSet?.type === 'comparison'">
          <ComparisonResultExplorer
            v-model:expanded-keys="comparisonExpandedKeys"
            v-model:highlight-key="comparisonHighlightKey"
            v-model:selected-type="comparisonSelectedType"
            v-model:search-text="comparisonSearchText"
            :tree-data="comparisonTreeData"
            :open-in-explorer="openComparisonSetInExplorer"
            :show-save="false"
            :expand-all="comparisonExpandAll"
            :collapse-all="comparisonCollapseAll"
            :type-options="comparisonTypeOptions"
            :handle-select-story="handleSelectComparisonStory"
          />
        </div>
      </template>
      <template #right>
        <div v-if="currentSelectedSet === null" class="size-full">
          <ProjectTabs
            :all-projects="availableProjects"
            :all-projects-in-tab="projectsInTab"
            :selected="project"
            @click-project="updateProject"
            @confirm-picker="updateProjectsInTab"
          />
          <div v-if="project !== null" class="mt-6">
            <div class="mx-6 flex justify-between">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchTextForSavedSets" placeholder="Search" />
              </IconField>
              <Button
                severity="danger"
                outlined
                label="Delete Project"
                icon="pi pi-trash"
                @click="confirmDelProject"
              ></Button>
            </div>
            <SavedSetsDataTables />
          </div>
        </div>
        <div v-else-if="currentSelectedSet.type === 'screenshot'">
          <div class="flex items-center justify-between px-6">
            <div class="pb-8 pt-4 text-lg">
              {{ currentSelectedSet.data.project }}
              <i class="pi pi-angle-right"></i>
              {{ currentSelectedSet.data.branch }}
              <i class="pi pi-angle-right"></i>
              {{ currentSelectedSet.data.name }}
            </div>
            <IconButton icon="pi pi-times" @click="closeSavedSet" />
          </div>
          <ScrollPanel class="scroll-panel-height">
            <div class="flex justify-center px-6 pb-6">
              <StyledImg :img="screenshotImgState" alt="screenshot" />
            </div>
          </ScrollPanel>
        </div>
        <div v-else-if="currentSelectedSet.type === 'comparison'" class="size-full">
          <div class="mt-4">
            <div class="mx-6 mb-6 flex items-center justify-between">
              <div id="saved-set-page-comparison-header" class="flex items-center gap-6">
                <div class="mr-4 font-bold">
                  {{ currentSelectedSet.data.project }}
                  <i class="pi pi-angle-right"></i>
                  {{ currentSelectedSet.data.name }}
                </div>
                <div>{{ currentSelectedSet.data.refBranch }} / {{ currentSelectedSet.data.refSetName }}</div>
                <i class="pi pi-arrow-right-arrow-left"></i>
                <div>{{ currentSelectedSet.data.testBranch }} / {{ currentSelectedSet.data.testSetName }}</div>
              </div>
              <div class="flex gap-2">
                <IconButton
                  v-if="comparisonSetSummary && comparisonImageState.type !== null"
                  v-tooltip.left="'Show summary'"
                  icon="pi pi-list"
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
                <IconButton icon="pi pi-times" :wrapper-size="40" :icon-size="16" @click="closeSavedSet" />
              </div>
            </div>
            <ScrollPanel class="scroll-panel-height w-full overflow-hidden">
              <ComparisonSummary
                v-if="comparisonSetSummary && comparisonImageState.type === null"
                id="saved-page-comparison-summary"
                class="p-6"
                :data="comparisonSetSummary"
                :diff="comparisonSetSummaryImgs.diff"
                :added="comparisonSetSummaryImgs.added"
                :removed="comparisonSetSummaryImgs.removed"
                @click-title="handleClickComparisonSummaryTitle"
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
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted, ref } from "vue";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import Button from "primevue/button";
import { useConfirm } from "primevue/useconfirm";
import Menu from "primevue/menu";
import ScrollPanel from "primevue/scrollpanel";
import StoryTreeExplorer from "../components/shared/story-explorer/StoryTreeExplorer.vue";
import ProjectTabs from "../components/shared/ProjectTabs.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import SavedSetsDataTables from "../components/saved-set/SavedSetsDataTables.vue";
import { useSavedSetStore } from "../stores/SavedSetStore";
import StyledImg from "../components/general/image/StyledImg.vue";
import ComparisonResultExplorer from "../components/shared/comparison-result-explorer/ComparisonResultExplorer.vue";
import IconButton from "../components/general/IconButton.vue";
import ComparisonImages from "../components/comparison/ComparisonImages.vue";
import ComparisonSummary from "../components/shared/comparison-summary/ComparisonSummary.vue";
import { screenshotComparisonResult } from "../utils/screenshot-comparison-result";

const store = useSavedSetStore();
const {
  project,
  availableProjects,
  projectsInTab,
  currentSelectedSet,
  screenshotSearchText,
  screenshotStoryTypeFilter,
  screenshotHighlightKey,
  screenshotExpandedKeys,
  screenshotTreeData,
  screenshotImgState,
  comparisonTreeData,
  comparisonSearchText,
  comparisonHighlightKey,
  comparisonTypeOptions,
  comparisonSelectedType,
  comparisonExpandedKeys,
  searchTextForSavedSets,
  comparisonImageState,
  comparisonSetSummary,
  comparisonSetSummaryImgs,
  showDiffImg,
  diffViewInVertical,
} = storeToRefs(store);
const {
  refreshData,
  updateProject,
  updateProjectsInTab,
  closeSavedSet,
  screenshotExpandAll,
  screenshotCollapseAll,
  comparisonExpandAll,
  comparisonCollapseAll,
  openScreenshotSetInExplorer,
  openComparisonSetInExplorer,
  deleteProject,
  handleSelectScreenshotStory,
  selectPrevScreenshotStory,
  selectNextScreenshotStory,
  handleClickComparisonSummaryTitle,
  handleSelectComparisonStory,
  selectPrevComparisonStory,
  selectNextComparisonStory,
  showComparisonSummary,
} = store;

const confirm = useConfirm();

const confirmDelProject = (event: Event) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Do you want to delete this set?",
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => {
      deleteProject();
    },
    reject: () => {},
  });
};

const scrollToComparison = () => {
  const el = document.getElementById("saved-page-comparison-table-section");
  if (el) el.scrollIntoView();
};

const scrollToScreenshot = () => {
  const el = document.getElementById("saved-page-screenshot-table-section");
  if (el) el.scrollIntoView();
};

const items = ref([
  { label: "Comparison", icon: "pi pi-eye", command: scrollToComparison },
  { label: "Screenshot", icon: "pi pi-camera", command: scrollToScreenshot },
]);

const screenshot = () => {
  let headerNode: HTMLDivElement = document.querySelector(
    "#saved-set-page-comparison-header",
  ) as unknown as HTMLDivElement;
  let summaryNode: HTMLDivElement = document.querySelector(
    "#saved-page-comparison-summary",
  ) as unknown as HTMLDivElement;
  headerNode = headerNode.cloneNode(true) as unknown as HTMLDivElement;
  summaryNode = summaryNode.cloneNode(true) as unknown as HTMLDivElement;
  headerNode.style.margin = "0 24px";
  screenshotComparisonResult(headerNode, summaryNode);
};

const handleShortcut = (e: KeyboardEvent) => {
  if (currentSelectedSet.value?.type === "screenshot") {
    if (e.key === "ArrowLeft" && e.altKey) {
      selectPrevScreenshotStory();
    } else if (e.key === "ArrowRight" && e.altKey) {
      selectNextScreenshotStory();
    }
  } else if (currentSelectedSet.value?.type === "comparison") {
    if (e.key === "ArrowLeft" && e.altKey) {
      selectPrevComparisonStory();
    } else if (e.key === "ArrowRight" && e.altKey) {
      selectNextComparisonStory();
    }
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
  height: calc(100vh - 151px);
}
</style>
