<template>
  <div class="relative">
    <div class="flex w-full justify-between">
      <div class="scrollbar-hidden flex basis-[calc(100%-35px)] flex-nowrap overflow-x-auto">
        <button
          v-for="x in allProjectsInTab"
          :key="x"
          v-ripple
          class="flex-none whitespace-nowrap px-3"
          :class="{ 'selected-btn': x === selected }"
          @click="$emit('clickProject', x)"
        >
          {{ x }}
        </button>
      </div>
      <div class="flex-shrink-0 flex-grow-0 basis-[35px]">
        <Button
          severity="secondary"
          size="small"
          text
          class="!w-[35px] !rounded-none"
          @click="pickerOpened = !pickerOpened"
          >+
        </Button>
      </div>
    </div>
    <div v-if="allProjectsInTab.length === 0" class="absolute inset-x-0 top-full z-[1] p-4 text-center">
      <Button severity="secondary" text size="large" @click="pickerOpened = !pickerOpened">Select project</Button>
    </div>
    <TransitionFade>
      <div
        v-if="pickerOpened"
        class="absolute inset-x-0 top-full z-[2] h-screen bg-neutral-300/20 bg-red-400 backdrop-blur-lg dark:bg-neutral-900/20"
      ></div>
    </TransitionFade>
    <TransitionCollapse>
      <div v-if="pickerOpened" class="absolute inset-x-0 top-full z-[3]">
        <div class="mt-5 flex justify-end px-3">
          <ProjectPickerList
            v-if="pickerOpened"
            :all-projects-in-tab="allProjectsInTab"
            :all-projects="allProjects"
            class="w-[800px]"
            @confirm="handleConfirmPicker"
            @cancel="pickerOpened = false"
          />
        </div>
      </div>
    </TransitionCollapse>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { ref } from "vue";
import TransitionCollapse from "../general/TransitionCollapse.vue";
import TransitionFade from "../general/TransitionFade.vue";
import ProjectPickerList from "./ProjectPickerList.vue";

defineProps<{
  allProjects: string[];
  allProjectsInTab: string[];
  selected: string | null;
}>();

const emit = defineEmits<{
  clickProject: [project: string];
  confirmPicker: [projects: string[]];
}>();

const pickerOpened = ref(false);

const handleConfirmPicker = (projects: string[]) => {
  pickerOpened.value = false;
  emit("confirmPicker", projects);
};
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}

.selected-btn {
  color: var(--p-highlight-color);
  background: var(--p-highlight-background);
}
</style>
