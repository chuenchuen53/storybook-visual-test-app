<template>
  <RefTestSetSelector
    :branches="savedRefData.branches ?? []"
    :set-info="savedRefData.setInfo ?? []"
    @select-branch="getAllRefSetInfo"
    @open-set="console.log($event)"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useSavedSetStore } from "../../stores/SavedSetStore";
import RefTestSetSelector from "./RefTestSetSelector.vue";

const store = useSavedSetStore();
const { savedRefData } = storeToRefs(store);
const { getAllRefBranches, getAllRefSetInfo } = store;

onMounted(() => {
  getAllRefBranches();
});
</script>
