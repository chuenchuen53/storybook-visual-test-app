<template>
  <Dialog v-model:visible="saveDialogOpen" modal header="Save Screenshot" :style="{ minWidth: '400px' }">
    <form @submit.prevent="saveScreenshot">
      <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
        <label for="save-screenshot-project-input" class="font-semibold leading-[42px]">Project</label>
        <AutoComplete
          v-model="saveInfo.project"
          input-id="save-screenshot-project-input"
          class="flex-auto"
          :suggestions="projectSuggestion"
          dropdown
          :empty-search-message="saveInfo.project"
          @complete="searchProject"
        />
        <label for="save-screenshot-branch-input" class="font-semibold leading-[42px]">Branch</label>
        <AutoComplete
          v-model="saveInfo.branch"
          input-id="save-screenshot-branch-input"
          class="flex-auto"
          :suggestions="branchSuggestion"
          dropdown
          :empty-search-message="saveInfo.branch"
          @complete="searchBranch"
        />
        <label for="save-screenshot-name-input" class="font-semibold leading-[42px]">Name</label>
        <InputText id="save-screenshot-name-input" v-model="saveInfo.name" class="flex-auto" autocomplete="off" />
      </div>

      <div class="mt-8 flex justify-end gap-2">
        <Button type="submit" label="Save" :disabled="disabled" :loading="isSaving"></Button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import AutoComplete from "primevue/autocomplete";
import { useScreenshotStore } from "../../stores/ScreenshotStore";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";

const store = useScreenshotStore();
const { saveDialogOpen, saveInfo, isSaving, allProjects, allBranches } = storeToRefs(store);
const { saveScreenshot, getAllSavedProjects, getAllBranches } = store;

const projectSuggestion = ref<string[]>([]);
const branchSuggestion = ref<string[]>([]);

const disabled = computed(() => !saveInfo.value.project || !saveInfo.value.branch || !saveInfo.value.name);

watch(
  () => saveInfo.value.project,
  async () => {
    if (allProjects.value.includes(saveInfo.value.project)) {
      await getAllBranches(saveInfo.value.project);
      branchSuggestion.value = allBranches.value.filter(x => x.includes(saveInfo.value.branch));
    }
  },
  { immediate: true },
);

const searchProject = (event: AutoCompleteCompleteEvent) => {
  projectSuggestion.value = allProjects.value.filter(x => x.includes(event.query));
};

const searchBranch = (event: AutoCompleteCompleteEvent) => {
  branchSuggestion.value = allBranches.value.filter(x => x.includes(event.query));
};

onMounted(async () => {
  await getAllSavedProjects();
  projectSuggestion.value = allProjects.value.filter(x => x.includes(saveInfo.value.project));
});
</script>
