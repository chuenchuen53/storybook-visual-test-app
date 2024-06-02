<template>
  <Listbox
    v-model="selectedId"
    :options="options"
    option-label="label"
    option-value="id"
    class="h-[316px] w-full"
    :pt="{ listContainer: { style: { 'max-height': '316px' } } }"
  >
    <template #option="{ option }">
      <div class="w-full space-y-1">
        <div>{{ labelDisplay(option) }}</div>
        <div class="flex w-full justify-between text-xs text-muted">
          <div>{{ viewportDisplay(option) }}</div>
          <div>{{ createdAtDisplay(option) }}</div>
        </div>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import Listbox from "primevue/listbox";
import type { SavedScreenshotSetInfo } from "../../../shared/type";

const selectedId = defineModel<string | null>("selectedId", { required: true });

defineProps<{
  options: SavedScreenshotSetInfo[];
}>();

function labelDisplay(x: SavedScreenshotSetInfo) {
  return x.name;
}

function viewportDisplay(x: SavedScreenshotSetInfo) {
  return `${x.viewport.width}x${x.viewport.height}`;
}

function createdAtDisplay(x: SavedScreenshotSetInfo) {
  return dayjs(x.createdAt).format("DD/MM/YYYY HH:mm");
}
</script>
