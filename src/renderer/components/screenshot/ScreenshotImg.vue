<template>
  <div v-if="selectedStory" class="mt-4 flex w-full justify-center">
    <div v-if="selectedStory.state === StoryState.WAITING" class="text-lg">
      <span>Waiting for capture <i class="pi pi-hourglass ml-2"></i></span>
    </div>
    <div v-else-if="selectedStory.state === StoryState.CAPTURING" class="text-lg">
      <span>Capturing <i class="pi pi-camera ml-2"></i></span>
    </div>
    <StyledImg v-else-if="selectedStory.state === StoryState.FINISHED" :img="imgState" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useScreenshotStore } from "../../stores/ScreenshotStore";
import { StoryState } from "../../../shared/type";
import StyledImg from "../general/image/StyledImg.vue";

const store = useScreenshotStore();
const { selectedStory, imgState } = storeToRefs(store);
</script>
