<template>
  <div class="flex-shrink-0 flex-grow-0 basis-[950px]">
    <div class="ref-test-set-selector flex h-[350px] rounded-br rounded-tr border border-[var(--p-surface-700)]">
      <div class="flex-shrink-0 flex-grow-0 basis-[225px] p-2">
        <div class="text-center">Branch</div>
        <Listbox v-model="selectedBranch" :options="branches" class="h-full w-full" />
      </div>
      <Divider layout="vertical" />
      <div class="flex-shrink-0 flex-grow-0 basis-[225px] p-2">
        <div class="text-center">Set</div>
        <Listbox v-model="selectedSet" :options="setInfo" option-label="createdAt" class="w-full" />
      </div>
      <Divider layout="vertical" />
      <div class="flex-shrink-0 flex-grow-0 basis-[500px] p-2">
        <div class="text-center">Information</div>
        <div>
          <table v-if="selectedSet" class="information-table">
            <tbody>
              <tr>
                <td>Id:</td>
                <td>{{ selectedSet.id }}</td>
              </tr>
              <tr>
                <td>Created at:</td>
                <td>{{ selectedSet.createdAt }}</td>
              </tr>
              <tr>
                <td>Viewport:</td>
                <td>{{ selectedSet.viewport.width }} x {{ selectedSet.viewport.height }}</td>
              </tr>
              <tr>
                <td>Stories:</td>
                <td>{{ selectedSet.stories }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="mt-4 flex justify-end">
      <Button label="Open" :disabled="selectedSet === null" @click="$emit('openSet', selectedSet)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Divider from "primevue/divider";
import Listbox from "primevue/listbox";
import { ref, watch } from "vue";
import Button from "primevue/button";
import type { RefTestSavedInfo } from "../../../shared/type";

defineProps<{
  branches: string[];
  setInfo: RefTestSavedInfo[];
}>();

const emit = defineEmits<{
  selectBranch: [branch: string | null];
  selectSet: [set: RefTestSavedInfo | null];
  openSet: [set: RefTestSavedInfo];
}>();

const selectedBranch = ref<string | null>(null);
const selectedSet = ref<RefTestSavedInfo | null>(null);

watch(selectedBranch, () => {
  emit("selectBranch", selectedBranch.value);
});

watch(selectedSet, () => {
  emit("selectSet", selectedSet.value);
});
</script>

<style scoped>
.information-table {
  td {
    padding: 0.5rem;
  }
}
</style>
