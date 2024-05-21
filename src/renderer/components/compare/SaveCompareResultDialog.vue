<template>
  <Dialog v-model:visible="savingDialogOpen" modal header="Save Screenshot" :style="{ minWidth: '400px' }">
    <div class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4"></div>

    <div class="mt-8 flex justify-end gap-2">
      <Button type="button" label="Save" :loading="isSaving" @click="saveScreenshot"></Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import { storeToRefs } from "pinia";
import { useCompareStore } from "../../stores/CompareStore";

const store = useCompareStore();
const { savingDialogOpen, isSaving } = storeToRefs(store);
const { saveScreenshot } = store;
</script>
