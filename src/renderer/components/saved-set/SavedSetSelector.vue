<template>
  <Dialog :visible="true" class="w-[1150px]">
    <div class="saved-set-selector flex justify-center">
      <div
        class="h-[350px] flex-shrink-0 flex-grow-0 basis-[150px] rounded-bl rounded-tl border-b border-l border-t border-[var(--p-surface-700)] p-2"
      >
        <div class="text-center">Type</div>
        <Listbox
          v-model="setType"
          :options="typeOptions"
          class="h-full w-full"
          option-label="label"
          option-value="value"
        />
      </div>
      <RefSetSelector v-if="setType === 'ref'" />
      <TestSetSelector v-else-if="setType === 'test'" />
      <div v-else>hi</div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Dialog from "primevue/dialog";
import Listbox from "primevue/listbox";
import RefSetSelector from "./RefSetSelector.vue";
import TestSetSelector from "./TestSetSelector.vue";

type SetType = "ref" | "test" | "compare";

const setType = ref<SetType>("ref");

const typeOptions = [
  { label: "Reference", value: "ref" },
  { label: "Test", value: "test" },
  { label: "Compare", value: "compare" },
];
</script>

<style>
.saved-set-selector {
  .p-listbox {
    border: none !important;
    border-radius: 0 !important;
    background: none !important;

    .p-listbox-list-container {
      max-height: 300px !important;
    }
  }

  .p-divider {
    margin: 0 !important;
  }
}
</style>
