<template>
  <main class="size-full">
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <CompareResultExplorer />
      </template>
      <template #right>
        <div class="size-full">
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
          <div v-else class="h-full overflow-y-auto">
            <div class="w-full p-6">
              <CompareSetting />
            </div>
            <ComparisonImages />
          </div>
        </div>
      </template>
    </LeftRightSplitContainer>
  </main>
  <SaveCompareResultDialog />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import ProjectTabs from "../components/shared/ProjectTabs.vue";
import ProjectPickerList from "../components/shared/ProjectPickerList.vue";
import CompareResultExplorer from "../components/comparison/comparison-result-explorer/ComparisonResultExplorer.vue";
import CompareSetting from "../components/comparison/CompareSetting.vue";
import { useComparisonStore } from "../stores/ComparisonStore";
import SaveCompareResultDialog from "../components/comparison/SaveCompareResultDialog.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import ComparisonImages from "../components/comparison/ComparisonImages.vue";

const store = useComparisonStore();
const { project, availableProjects, projectsInTab } = storeToRefs(store);
const { updateProject, updateProjectsInTab } = store;

const diffDisplayMode = ref<"ref-test" | "ref-diff">("ref-test");

const toggleDiffViewMode = () => {
  diffDisplayMode.value = diffDisplayMode.value === "ref-test" ? "ref-diff" : "ref-test";
};

const displayTabsSetting = ref(false);

const handlePickerConfirm = (projects: string[]) => {
  updateProjectsInTab(projects);
  displayTabsSetting.value = false;
};
</script>
