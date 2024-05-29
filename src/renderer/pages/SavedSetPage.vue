<template>
  <main>
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <div v-if="currentSelectedSetType === 'ref' || currentSelectedSetType === 'test'">
          <StyledTree
            v-model:expandedKeys="refTestExpandedKeys"
            v-model:highlightKey="selectedKey"
            :data="refTestTreeData"
            class="px-3 pb-8 pt-2 text-sm"
            @node-click="onNodeSelect"
          >
            <template #node-content="{ node }">
              <div v-if="isLeaf(node)">
                <div class="flex items-baseline justify-between gap-2">
                  <div class="flex gap-2">
                    <div>
                      {{ node.label }}
                    </div>
                    <i v-if="node.data.storyErr" class="pi pi-exclamation-triangle !text-s text-red-400"></i>
                  </div>
                </div>
              </div>
              <div v-else>
                {{ node.label }}
              </div>
            </template>
          </StyledTree>
        </div>
        <div v-if="currentSelectedSetType === 'compare'">
          <SelectButton
            v-model="comparisonSelectedType"
            :options="selectOptions"
            option-label="name"
            option-value="value"
            :allow-empty="false"
            class="w-full px-3 [&>*]:flex-grow"
          >
            <template #option="slotProps">
              <div class="text-nowrap text-xs">
                <span>
                  {{ slotProps.option.name }}
                </span>
                <span v-if="comparisonTypeOptions[slotProps.option.value] !== null" class="text-[10px] text-gray-400">
                  ({{ comparisonTypeOptions[slotProps.option.value] }})
                </span>
              </div>
            </template>
          </SelectButton>
          <StyledTree
            v-model:expandedKeys="comparisonExpandedKeys"
            v-model:highlightKey="comparisonHighlightKey"
            :data="comparisonTreeData ?? []"
            class="px-3 pb-8 pt-2 text-sm"
            @node-click="onNodeSelect"
          >
          </StyledTree>
        </div>
      </template>
      <template #right>
        <div v-if="currentSelectedSetType === null" class="size-full">
          <ProjectTabs
            :all-projects="availableProjects"
            :all-projects-in-tab="projectsInTab"
            :selected="project"
            @click-project="updateProject"
            @click-add="displayTabsSetting = true"
          />
          <div v-if="displayTabsSetting">
            <ProjectPickerList
              :all-projects="availableProjects"
              :all-projects-in-tab="projectsInTab"
              @confirm="handlePickerConfirm"
              @cancel="displayTabsSetting = false"
            />
          </div>
          <div class="flex items-center justify-center p-4">
            <SavedSetsDataTables />
          </div>
        </div>
        <div v-else-if="currentSelectedSetType === 'ref' || currentSelectedSetType === 'test'">
          <button @click="deselectSavedSet">go back</button>
          <StyledImg :img="refTestImgState" alt="screenshot" />
        </div>
      </template>
    </LeftRightSplitContainer>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import Image from "primevue/image";
import ProgressSpinner from "primevue/progressspinner";
import SelectButton from "primevue/selectbutton";
import { isLeaf } from "../components/general/tree/tree-helper";
import StyledTree from "../components/general/tree/StyledTree.vue";
import ProjectPickerList from "../components/shared/ProjectPickerList.vue";
import ProjectTabs from "../components/shared/ProjectTabs.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import SavedSetsDataTables from "../components/saved-set/SavedSetsDataTables.vue";
import { useSavedSetStore } from "../stores/SavedSetStore";
import StyledImg from "../components/general/image/StyledImg.vue";
import type { NodeData } from "../components/general/tree/type";
import type { StoryMetadataInExplorer } from "../components/screenshot/story-explorer/helper";
import type { StoriesDiffResult } from "../../shared/type";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";

const store = useSavedSetStore();
const {
  project,
  availableProjects,
  projectsInTab,
  currentSelectedSetType,
  selectedKey,
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
  comparisonImageState,
} = storeToRefs(store);
const {
  refreshData,
  updateProject,
  updateProjectsInTab,
  updateDisplayingImg,
  deselectSavedSet,
  updateComparisonDisplayImg,
} = store;

const displayTabsSetting = ref(false);

const handlePickerConfirm = (projects: string[]) => {
  updateProjectsInTab(projects);
  displayTabsSetting.value = false;
};

const onNodeSelect = (node: NodeData) => {
  const data: StoryMetadataInExplorer | undefined = node.data;
  if (data) {
    updateDisplayingImg(data.id);
  }
};

const selectOptions: { name: string; value: keyof StoriesDiffResult }[] = [
  { name: "Diff", value: "diff" },
  { name: "Added", value: "added" },
  { name: "Removed", value: "removed" },
  { name: "Same", value: "same" },
];

const onComparisonNodeSelect = (node: NodeData) => {
  if (node.data) {
    const data: ComparisonResultTreeLeaf = node.data;
    updateComparisonDisplayImg(data);
  }
};

onMounted(() => {
  refreshData();
});
</script>
