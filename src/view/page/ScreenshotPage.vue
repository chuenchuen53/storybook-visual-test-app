<template>
  <div class="flex-grow">
    <div class="fixed bottom-0 left-0 top-[50px] z-10 w-[450px]">
      <StoryTreeExplorer />
    </div>

    <div class="justify-content-center ml-[450px]">
      <div class="w-full p-6">
        <Steps :active-step="activeStep" :model="items" class="mb-6"> </Steps>
        <MetadataCrawler />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Steps from "primevue/steps";
import MetadataCrawler from "../components/screenshot/MetadataCrawler.vue";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import StoryTreeExplorer from "../components/StoryTreeExplorer.vue";

const store = useScreenshotStore();
const { state, activeStep } = storeToRefs(store);

const items = [
  { label: "Idle" },
  { label: "Checking" },
  { label: "Preparing" },
  { label: "Metadata" },
  { label: "Preparing" },
  { label: "Screenshot" },
  { label: "Finished" },
];
</script>
