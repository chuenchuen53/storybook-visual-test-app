<template>
  <div>
    <ProjectTabs
      :all-projects="availableProjects"
      :all-projects-in-tab="projectsInTab"
      :selected="project"
      @click-project="updateProject"
      @confirm-picker="updateProjectsInTab"
    />
    <div v-if="project" class="flex w-full justify-center p-6">
      <div class="grid w-full max-w-[700px] grid-cols-[50px_1fr_1fr] gap-x-6 gap-y-4">
        <div class="col-start-2">Reference Set</div>
        <div>Test Set</div>

        <div class="leading-[42px]">Branch</div>
        <Select class="w-full" :model-value="refSet.branch" :options="availableBranch" @change="updateRefBranch" />
        <Select class="w-full" :model-value="testSet.branch" :options="availableBranch" @change="updateTestBranch" />

        <div class="leading-[42px]">Set</div>
        <StyledSetListbox v-model:selected-id="refSet.setId" :options="availableRefSets" />
        <StyledSetListbox v-model:selected-id="testSet.setId" :options="availableTestSets" />

        <Button
          class="col-start-3 justify-self-end"
          :disabled="isComparing || disableCompareBtn"
          :loading="isComparing"
          label="Compare"
          @click="compare"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import Select from "primevue/select";
import { storeToRefs } from "pinia";
import { useComparisonStore } from "../../stores/ComparisonStore";
import ProjectTabs from "../shared/ProjectTabs.vue";
import StyledSetListbox from "./StyledSetListbox.vue";
import type { SelectChangeEvent } from "primevue/select";

const store = useComparisonStore();
const { isComparing, project, availableSets, refSet, testSet, availableProjects, projectsInTab } = storeToRefs(store);
const { updateRefSetBranch, updateTestSetBranch, compare, updateProject, updateProjectsInTab } = store;

const disableCompareBtn = computed(() => {
  return (
    !project.value ||
    !refSet.value.branch ||
    !testSet.value.branch ||
    !refSet.value.setId ||
    !testSet.value.setId ||
    refSet.value.setId === testSet.value.setId
  );
});

const availableBranch = computed(() => {
  return Object.keys(availableSets.value.screenshot);
});

const updateRefBranch = (e: SelectChangeEvent) => {
  updateRefSetBranch(e.value);
};

const updateTestBranch = (e: SelectChangeEvent) => {
  updateTestSetBranch(e.value);
};

const availableRefSets = computed(() => {
  if (refSet.value.branch === null) return [];
  if (availableSets.value.screenshot[refSet.value.branch] === undefined) return [];
  return Object.values(availableSets.value.screenshot[refSet.value.branch]);
});

const availableTestSets = computed(() => {
  if (testSet.value.branch === null) return [];
  if (availableSets.value.screenshot[testSet.value.branch] === undefined) return [];
  return Object.values(availableSets.value.screenshot[testSet.value.branch]);
});
</script>
