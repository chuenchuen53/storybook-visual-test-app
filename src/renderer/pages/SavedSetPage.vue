<template>
  <main>
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <div v-if="currentSelectedSetType === 'ref' || currentSelectedSetType === 'test'">
          <StyledTree
            v-model:expandedKeys="expandedKeys"
            v-model:highlightKey="selectedKey"
            :data="explorerTreeData"
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
            v-if="selectedComparisonResultType"
            v-model="selectedComparisonResultType"
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
                <span class="text-[10px] text-gray-400">
                  ({{ selectedComparisonResultType[slotProps.option.value] }})
                </span>
              </div>
            </template>
          </SelectButton>
          <StyledTree
            v-model:expandedKeys="expandedKeys"
            v-model:highlightKey="selectedComparisonResultType"
            :data="comparisonExplorerTreeData ?? []"
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
          <div class="mt-4 flex w-full justify-center">
            <div v-if="displayingImg.loading">
              <ProgressSpinner />
            </div>
            <div v-else>
              <div v-if="displayingImg.isExist && displayingImg.base64">
                <Image :src="'data:image/png;base64,' + displayingImg.base64" alt="screenshot" preview />
              </div>
              <div v-else class="text-center text-gray-400">Image not exist</div>
            </div>
          </div>
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
  expandedKeys,
  selectedKey,
  explorerTreeData,
  displayingImg,
  selectedComparisonResultType,
  comparisonExplorerTreeData,
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
