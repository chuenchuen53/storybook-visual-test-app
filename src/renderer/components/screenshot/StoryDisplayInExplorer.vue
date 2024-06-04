<template>
  <div class="flex items-baseline justify-between gap-2">
    <div class="flex gap-2">
      <i class="!text-sm" :class="iconCls(data.state)"></i>
      <div>
        {{ label }}
      </div>
      <i v-if="data.storyErr" class="pi pi-exclamation-triangle !text-s text-red-400"></i>
    </div>
    <div v-if="data.startTime && data.endTime" class="text-xs text-gray-500">
      {{ timeSpent(data.startTime, data.endTime) }}ms
    </div>
  </div>
</template>

<script setup lang="ts">
import { StoryState } from "../../../shared/type";
import type { StoryMetadataInScreenshotPageExplorer } from "../shared/story-explorer/helper";

defineProps<{
  label: string;
  data: StoryMetadataInScreenshotPageExplorer;
}>();

function timeSpent(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime.getTime() - startTime.getTime();
  return diff.toString();
}

function iconCls(state: StoryState): string {
  switch (state) {
    case StoryState.WAITING:
      return "pi pi-hourglass opacity-50";
    case StoryState.CAPTURING:
      return "pi pi-camera text-primary animate-pulse";
    case StoryState.FINISHED:
      return "pi pi-check-circle text-primary";
  }
}
</script>
