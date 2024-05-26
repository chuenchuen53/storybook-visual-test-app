<template>
  <div class="flex flex-col items-end gap-6">
    <PickList v-model="pickerListData" data-key="project" class="w-full">
      <template #item="{ item }">
        {{ item.project }}
      </template>
    </PickList>
    <div class="space-x-2">
      <Button label="Confirm" @click="$emit('confirm', toStringArr(pickerListData[1]))" />
      <Button severity="secondary" label="Cancel" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PickList from "primevue/picklist";
import Button from "primevue/button";

import { ref } from "vue";

const props = defineProps<{
  allProjects: string[];
  allProjectsInTab: string[];
}>();

defineEmits<{
  confirm: [projects: string[]];
  cancel: [];
}>();

const pickerListData = ref<[{ project: string }[], { project: string }[]]>([
  props.allProjects.filter(x => !props.allProjectsInTab.includes(x)).map(x => ({ project: x })),
  props.allProjectsInTab.map(x => ({ project: x })),
]);

const toStringArr = (data: { project: string }[]) => data.map(x => x.project);
</script>
