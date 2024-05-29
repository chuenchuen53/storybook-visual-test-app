<template>
  <div v-if="selectedStory" class="mt-4 flex w-full justify-center">
    <div v-if="selectedStory.state === StoryState.WAITING">Waiting for capture ...</div>
    <div v-else-if="selectedStory.state === StoryState.CAPTURING">Capturing ...</div>
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
