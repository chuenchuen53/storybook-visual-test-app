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
        <Select class="w-full" :model-value="refSet.branch" :options="availableRefBranch" @change="updateRefBranch" />
        <Select
          class="w-full"
          :model-value="testSet.branch"
          :options="availableTestBranch"
          @change="updateTestBranch"
        />

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
import type { SelectChangeEvent } from "primevue/select";
import Select from "primevue/select";
import { storeToRefs } from "pinia";
import { useComparisonStore } from "../../stores/ComparisonStore";
import ProjectTabs from "../shared/ProjectTabs.vue";
import StyledSetListbox from "./StyledSetListbox.vue";

const store = useComparisonStore();
const { isComparing, project, availableSets, refSet, testSet, availableProjects, projectsInTab } = storeToRefs(store);
const { updateRefSetBranch, updateTestSetBranch, compare, updateProject, updateProjectsInTab } = store;

const disableCompareBtn = computed(() => {
  return !project.value || !refSet.value.branch || !testSet.value.branch || !refSet.value.setId || !testSet.value.setId;
});

const availableRefBranch = computed(() => {
  return availableSets.value.ref.map(x => x.branch);
});

const availableTestBranch = computed(() => {
  return availableSets.value.test.map(x => x.branch);
});

const updateRefBranch = (e: SelectChangeEvent) => {
  updateRefSetBranch(e.value);
};

const updateTestBranch = (e: SelectChangeEvent) => {
  updateTestSetBranch(e.value);
};

const availableRefSets = computed(
  () =>
    availableSets.value.ref
      .find(x => x.branch === refSet.value.branch)
      ?.setList.slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) ?? [],
);

const availableTestSets = computed(
  () =>
    availableSets.value.test
      .find(x => x.branch === testSet.value.branch)
      ?.setList.slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) ?? [],
);
</script>
