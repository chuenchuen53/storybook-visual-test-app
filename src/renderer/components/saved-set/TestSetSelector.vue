<template>
  <RefTestSetSelector
    :branches="savedTestData.branches ?? []"
    :set-info="savedTestData.setInfo ?? []"
    @select-branch="getAllTestSetInfo"
    @open-set="console.log($event)"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import RefTestSetSelector from "./RefTestSetSelector.vue";

const store = useSavedSetStore();
const { savedTestData } = storeToRefs(store);
const { getAllTestBranches, getAllTestSetInfo } = store;

onMounted(() => {
  getAllTestBranches();
});
</script>
