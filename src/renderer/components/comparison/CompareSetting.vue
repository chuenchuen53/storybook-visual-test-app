<template>
  <div v-if="project === null" class="text-center text-lg">Select a project to compare</div>
  <div v-else>
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
          :model-value="refSet.setId"
          :options="availableRefSets"
          option-label="label"
          option-value="id"
          @change="updateRefUuid"
        />
      </div>
      <div>
        <Select
          class="w-full"
          :model-value="testSet.setId"
          :options="availableTestSets"
          option-label="label"
          option-value="id"
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
import Select from "primevue/select";
import { storeToRefs } from "pinia";
import { useComparisonStore } from "../../stores/ComparisonStore";
import type { SelectChangeEvent } from "primevue/select";

const store = useComparisonStore();
const { isComparing, project, availableSets, refSet, testSet } = storeToRefs(store);
const { refreshData, updateRefSetBranch, updateTestSetBranch, updateRefSetId, updateTestSetId, compare } = store;

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

const availableRefSets = computed(() => {
  return (
    availableSets.value.ref
      .find(x => x.branch === refSet.value.branch)
      ?.setList.map(x => ({
        ...x,
        label: `${x.viewport.width}x${x.viewport.height} - ${new Date(x.createdAt).toLocaleString()}`,
      })) ?? []
  );
});

const availableTestSets = computed(() => {
  return (
    availableSets.value.test
      .find(x => x.branch === testSet.value.branch)
      ?.setList.map(x => ({
        ...x,
        label: `${x.viewport.width}x${x.viewport.height} - ${new Date(x.createdAt).toLocaleString()}`,
      })) ?? []
  );
});

const updateRefUuid = (e: SelectChangeEvent) => {
  updateRefSetId(e.value);
};

const updateTestUuid = (e: SelectChangeEvent) => {
  updateTestSetId(e.value);
};

// todo: move to page
onMounted(() => {
  refreshData();
});
</script>
