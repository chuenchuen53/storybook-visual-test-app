<template>
  <Dialog v-model:visible="saveDialogOpen" modal header="Save Screenshot" :style="{ minWidth: '400px' }">
    <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
      <label for="save-screenshot-type-select" class="font-semibold leading-[42px]">Type</label>
      <Select
        v-model="saveInfo.type"
        option-value="value"
        option-label="value"
        :options="screenshotSaveTypes"
        placeholder="Select save type"
        checkmark
        :highlight-on-select="false"
      />

      <label for="save-screenshot-project-input" class="font-semibold leading-[42px]">Project</label>
      <InputText id="save-screenshot-project-input" v-model="saveInfo.project" class="flex-auto" autocomplete="off" />
      <label for="save-screenshot-branch-input" class="font-semibold leading-[42px]">Branch</label>
      <InputText id="save-screenshot-branch-input" v-model="saveInfo.branch" class="flex-auto" autocomplete="off" />
      <label for="save-screenshot-name-input" class="font-semibold leading-[42px]">Name</label>
      <InputText id="save-screenshot-name-input" v-model="saveInfo.name" class="flex-auto" autocomplete="off" />
    </div>

    <div class="mt-8 flex justify-end gap-2">
      <Button type="button" label="Save" :loading="isSaving" @click="saveScreenshot"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Select from "primevue/select";

import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useScreenshotStore } from "../../stores/ScreenshotStore";

const store = useScreenshotStore();
const { saveDialogOpen, saveInfo, isSaving } = storeToRefs(store);
const { saveScreenshot } = store;

// todo: add typing
const screenshotSaveTypes = ref([{ value: "reference" }, { value: "test" }]);
</script>
