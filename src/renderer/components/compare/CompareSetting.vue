<template>
  <div>
    <div class="mb-6 pl-[124px]">
      <FloatLabel class="w-80">
        <Select
          input-id="compare-project-select"
          class="w-80"
          :model-value="project"
          :options="availableProjects"
          @change="handleSelectionChange"
        />
        <label for="compare-project-select">Select a project</label>
      </FloatLabel>
    </div>
    <div class="grid grid-cols-[100px_1fr_1fr] gap-x-6 gap-y-4">
      <div></div>
      <div>Reference Set</div>
      <div>Test Set</div>

      <div class="leading-[42px]">Branch</div>
      <div>
        <Select class="w-full" :model-value="refSet.branch" :options="availableRefBranch" @change="updateRefBranch" />
      </div>
      <div>
        <Select
          class="w-full"
          :model-value="testSet.branch"
          :options="availableTestBranch"
          @change="updateTestBranch"
        />
      </div>

      <div class="leading-[42px]">Set</div>
      <div>
        <Select
          class="w-full"
          :model-value="refSet.uuid"
          :options="availableRefSets"
          option-label="label"
          option-value="uuid"
          @change="updateRefUuid"
        />
      </div>
      <div>
        <Select
          class="w-full"
          :model-value="testSet.uuid"
          :options="availableTestSets"
          option-label="label"
          option-value="uuid"
          @change="updateTestUuid"
        />
      </div>
    </div>
    <div class="mt-6 flex justify-end">
      <Button :disabled="isComparing || disableCompareBtn" :loading="isComparing" label="Compare" @click="compare" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";
import Select from "primevue/select";
import { storeToRefs } from "pinia";
import { useCompareStore } from "../../stores/CompareStore";
import type { SelectChangeEvent } from "primevue/select";

const store = useCompareStore();
const { isComparing, project, availableProjects, availableSets, refSet, testSet } = storeToRefs(store);
const {
  refreshData,
  updateProject,
  updateRefSetBranch,
  updateTestSetBranch,
  updateRefSetUuid,
  updateTestSetUuid,
  compare,
} = store;

const disableCompareBtn = computed(() => {
  return !project.value || !refSet.value.branch || !testSet.value.branch || !refSet.value.uuid || !testSet.value.uuid;
});

const handleSelectionChange = (e: SelectChangeEvent) => {
  updateProject(e.value);
};

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

const availableRefSets = computed(() => {
  return (
    availableSets.value.ref
      .find(x => x.branch === refSet.value.branch)
      ?.setList.map(x => ({
        ...x,
        label: `${x.viewport.width}x${x.viewport.height} - ${new Date(x.createAt).toLocaleString()}`,
      })) ?? []
  );
});

const availableTestSets = computed(() => {
  return (
    availableSets.value.test
      .find(x => x.branch === testSet.value.branch)
      ?.setList.map(x => ({
        ...x,
        label: `${x.viewport.width}x${x.viewport.height} - ${new Date(x.createAt).toLocaleString()}`,
      })) ?? []
  );
});

const updateRefUuid = (e: SelectChangeEvent) => {
  updateRefSetUuid(e.value);
};

const updateTestUuid = (e: SelectChangeEvent) => {
  updateTestSetUuid(e.value);
};

onMounted(() => {
  refreshData();
});
</script>
