<template>
  <div class="flex-grow">
    <div class="fixed bottom-0 left-0 top-[50px] z-10 w-[450px]">
      <StoryTreeExplorer />
    </div>

    <div class="justify-content-center ml-[450px]">
      <div class="w-full p-6">
        <Steps :active-step="activeStep" :model="items" class="mb-6"> </Steps>
        <MetadataCrawler />
        <div class="mt-4 flex w-full justify-center">
          <div v-if="displayingImg.loading">
            <ProgressSpinner />
          </div>
          <div v-else>
            <div v-if="displayingImg.isExist && displayingImg.base64">
              <Image :src="'data:image/png;base64,' + displayingImg.base64" alt="screenshot" preview />
            </div>
            <div v-else class="text-center text-gray-400">Image not exist</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SaveDialog />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Steps from "primevue/steps";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import MetadataCrawler from "../components/screenshot/MetadataCrawler.vue";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import StoryTreeExplorer from "../components/screenshot/story-explorer/StoryTreeExplorer.vue";
import SaveDialog from "../components/screenshot/SaveDialog.vue";

const store = useScreenshotStore();
const { activeStep, displayingImg } = storeToRefs(store);

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
