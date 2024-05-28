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
            <ScreenshotImg />
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
import ScrollPanel from "primevue/scrollpanel";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import MetadataCrawler from "../components/screenshot/MetadataCrawler.vue";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import StoryTreeExplorer from "../components/screenshot/story-explorer/StoryTreeExplorer.vue";
import SaveDialog from "../components/screenshot/SaveDialog.vue";
import ScreenshotImg from "../components/screenshot/ScreenshotImg.vue";

const store = useScreenshotStore();
const { activeStep } = storeToRefs(store);

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

<style scoped>
.app-content-height {
  height: calc(100vh - 50px);
}
</style>
