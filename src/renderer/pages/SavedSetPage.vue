<template>
  <main>
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <div v-if="currentSelectedSet === null" class="flex flex-col">
          <Menu :model="items" :pt="{ root: { style: { border: 'none', background: 'transparent' } } }" />
        </div>
        <div v-if="currentSelectedSet?.type === 'reference' || currentSelectedSet?.type === 'test'">
          <StoryTreeExplorer
            v-model:expanded-keys="refTestExpandedKeys"
            v-model:highlight-key="refTestHighlightKey"
            v-model:story-type-filter="refTestStoryTypeFilter"
            v-model:search-text="refTestSearchText"
            :tree-data="refTestTreeData"
            :show-save="false"
            :open-in-explorer="openTestRefSetInExplorer"
            :expand-all="refTestExpandAll"
            :collapse-all="refTestCollapseAll"
            :handle-select-story="updateDisplayingImg"
          >
            <template #story-display="slotProps">
              <div class="flex gap-2">
                <i class="pi pi-bookmark text-primary !text-sm"></i>
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
            :handle-select-story="updateComparisonDisplayImg"
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
          <div class="mt-6">
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
        <div v-else-if="currentSelectedSet.type === 'reference' || currentSelectedSet.type === 'test'">
          <div class="flex items-center justify-between px-6">
            <div class="pb-8 pt-4 text-lg">
              {{ currentSelectedSet.data.project }}
              <i class="pi pi-angle-right"></i>
              {{ currentSelectedSet.data.branch }}
              <i class="pi pi-angle-right"></i>
              {{ currentSelectedSet.data.name }}
            </div>
            <IconButton icon="pi pi-times" @click="deselectSavedSet" />
          </div>
          <ScrollPanel class="ref-test-scroll-panel-height">
            <div class="flex justify-center px-6 pb-6">
              <StyledImg :img="refTestImgState" alt="screenshot" />
            </div>
          </ScrollPanel>
        </div>
        <div v-else-if="currentSelectedSet.type === 'comparison'">
          <div class="flex items-center justify-between px-6">
            <div class="pb-8 pt-4 text-lg">
              <div class="flex items-center gap-6">
                <div class="mr-4 font-bold">
                  {{ currentSelectedSet.data.project }}
                  <i class="pi pi-angle-right"></i>
                  {{ currentSelectedSet.data.name }}
                </div>
                <div>{{ currentSelectedSet.data.refBranch }} / {{ currentSelectedSet.data.refSetName }}</div>
                <i class="pi pi-arrow-right-arrow-left"></i>
                <div>{{ currentSelectedSet.data.testBranch }} / {{ currentSelectedSet.data.testSetName }}</div>
              </div>
            </div>
            <IconButton icon="pi pi-times" @click="deselectSavedSet" />
          </div>
          <ScrollPanel class="ref-test-scroll-panel-height">
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
      </template>
    </LeftRightSplitContainer>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
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
import ComparisonResultExplorer from "../components/comparison/comparison-result-explorer/ComparisonResultExplorer.vue";
import IconButton from "../components/general/IconButton.vue";
import ComparisonImages from "../components/comparison/ComparisonImages.vue";
import type { ComparisonSavedInfo, StoriesDiffResult } from "../../shared/type";
import type { NodeData } from "../components/general/tree/type";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";

const store = useSavedSetStore();
const {
  project,
  availableProjects,
  projectsInTab,
  currentSelectedSet,
  refTestSearchText,
  refTestStoryTypeFilter,
  refTestHighlightKey,
  refTestExpandedKeys,
  refTestTreeData,
  refTestImgState,
  comparisonTreeData,
  comparisonSearchText,
  comparisonHighlightKey,
  comparisonTypeOptions,
  comparisonSelectedType,
  comparisonExpandedKeys,
  searchTextForSavedSets,
  comparisonImageState,
  showDiffImg,
  diffViewInVertical,
} = storeToRefs(store);
const {
  refreshData,
  updateProject,
  updateProjectsInTab,
  updateDisplayingImg,
  deselectSavedSet,
  updateComparisonDisplayImg,
  refTestExpandAll,
  refTestCollapseAll,
  comparisonExpandAll,
  comparisonCollapseAll,
  openTestRefSetInExplorer,
  openComparisonSetInExplorer,
  deleteProject,
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

const scrollToRef = () => {
  const el = document.getElementById("saved-page-ref-table-section");
  if (el) el.scrollIntoView();
};

const scrollToTest = () => {
  const el = document.getElementById("saved-page-test-table-section");
  if (el) el.scrollIntoView();
};

const items = ref([
  { label: "Comparison", icon: "pi pi-eye", command: scrollToComparison },
  { label: "Reference", icon: "pi pi-book", command: scrollToRef },
  { label: "Test", icon: "pi pi-chart-bar", command: scrollToTest },
]);

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.ref-test-scroll-panel-height {
  height: calc(100vh - 126px);
}
</style>
