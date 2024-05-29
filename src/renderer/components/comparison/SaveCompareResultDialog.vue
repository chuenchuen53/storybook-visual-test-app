<template>
  <Dialog v-model:visible="saveDialogOpen" modal header="Save Screenshot" :style="{ minWidth: '400px' }">
    <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4"></div>

    <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
      <label for="save-comparison-name-input" class="font-semibold leading-[42px]">Name</label>
      <InputText id="save-comparison-name-input" v-model="saveInfo.name" class="flex-auto" autocomplete="off" />
    </div>

    <div class="mt-8 flex justify-end gap-2">
      <Button type="button" label="Save" :loading="isSaving" @click="saveScreenshot"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { storeToRefs } from "pinia";
import InputText from "primevue/inputtext";
import { useComparisonStore } from "../../stores/ComparisonStore";

const store = useComparisonStore();
const { isSaving, saveDialogOpen, saveInfo } = storeToRefs(store);
const { saveScreenshot } = store;
</script>
