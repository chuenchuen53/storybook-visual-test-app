<template>
  <div class="flex gap-4">
    <Timeline
      :value="timelineItems"
      class="screenshot-timeline"
      :pt="{ eventOpposite: { style: { width: '100px', flex: 'none' } }, event: { style: { minHeight: '40px' } } }"
    >
      <template #opposite="slotProps">
        <small class="text-surface-500 dark:text-surface-400">{{ displayDate(slotProps.item) }}</small>
      </template>
      <template #content="slotProps">
        {{ displayStatus(slotProps.item) }}
      </template>
    </Timeline>
  </div>
</template>

<script setup lang="ts">
import Timeline from "primevue/timeline";
import dayjs from "dayjs";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { ScreenshotState } from "../../../shared/type";
import { useScreenshotStore } from "../../stores/ScreenshotStore";

interface Item {
  date: string;
  status: string;
}

const store = useScreenshotStore();
const { state, stateTimeStamp, totalStoriesCount, finishedStoriesCount } = storeToRefs(store);

const timelineItems = computed(() => {
  if (state.value === ScreenshotState.IDLE) return [];
  const arr = [
    item(ScreenshotState.CHECKING_SERVICE),
    item(ScreenshotState.PREPARING_METADATA_BROWSER),
    item(ScreenshotState.COMPUTING_METADATA),
    item(ScreenshotState.PREPARING_SCREENSHOT_BROWSER),
    item(ScreenshotState.CAPTURING_SCREENSHOT),
    item(ScreenshotState.FINISHED),
  ];

  if (state.value === ScreenshotState.CAPTURING_SCREENSHOT) {
    arr[arr.length - 2].status += ` (${finishedStoriesCount.value}/${totalStoriesCount.value})`;
  }
  if (state.value === ScreenshotState.FINISHED) {
    arr[arr.length - 1].status += ` (total time: ${totalTime.value})`;
  } else if (state.value === ScreenshotState.FAILED) {
    arr.pop();
    arr.push({
      date: timeDisplay(ScreenshotState.FAILED),
      status: getStateDescription(ScreenshotState.FAILED),
    });
  }

  return arr;
});

const totalTime = computed(() => {
  const start = stateTimeStamp.value.get(ScreenshotState.CHECKING_SERVICE);
  const end = stateTimeStamp.value.get(ScreenshotState.FINISHED);
  if (!start || !end) return "";
  const diffInSeconds = dayjs(end).diff(start, "second");
  return dayjs().startOf("day").second(diffInSeconds).format("HH:mm:ss");
});

function getStateDescription(x: ScreenshotState) {
  switch (x) {
    case ScreenshotState.IDLE:
      return "";
    case ScreenshotState.CHECKING_SERVICE:
      return "Checking service";
    case ScreenshotState.PREPARING_METADATA_BROWSER:
      return "Preparing metadata browser";
    case ScreenshotState.COMPUTING_METADATA:
      return "Computing metadata";
    case ScreenshotState.PREPARING_SCREENSHOT_BROWSER:
      return "Preparing screenshot browser";
    case ScreenshotState.CAPTURING_SCREENSHOT:
      return "Capturing screenshot";
    case ScreenshotState.FINISHED:
      return "Finish";
    case ScreenshotState.FAILED:
      return "Failed";
  }
}

function timeDisplay(x: ScreenshotState) {
  const t = stateTimeStamp.value.get(x);
  if (!t) return "";
  return dayjs(t).format("HH:mm:ss");
}

function item(x: ScreenshotState): Item {
  return {
    date: timeDisplay(x),
    status: getStateDescription(x),
  };
}

const displayDate = (x: Item) => x.date;
const displayStatus = (x: Item) => x.status;
</script>

<style scoped></style>
