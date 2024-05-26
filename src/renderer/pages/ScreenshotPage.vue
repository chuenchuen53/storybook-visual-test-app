<template>
  <main class="size-full">
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <StoryTreeExplorer />
      </template>
      <template #right>
        <ScrollPanel class="app-content-height w-full overflow-hidden">
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
        </ScrollPanel>
      </template>
    </LeftRightSplitContainer>
  </main>

  <SaveDialog />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Steps from "primevue/steps";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import ScrollPanel from "primevue/scrollpanel";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
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

<style>
.app-content-height {
  height: calc(100vh - 59px);
}
</style>
