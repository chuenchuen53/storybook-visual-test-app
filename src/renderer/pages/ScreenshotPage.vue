<template>
  <main>
    <Splitter class="size-full !rounded-none !border-none" :gutter-size="2">
      <SplitterPanel :size="leftInitWidthRatio" :min-size="1">
        <StoryTreeExplorer />
      </SplitterPanel>
      <SplitterPanel :size="rightInitWidthRatio" class="align-items-center justify-content-center flex">
        <ScrollPanel class="app-content-height w-full">
          <div class="w-full">
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
        </ScrollPanel>
      </SplitterPanel>
    </Splitter>
  </main>

  <SaveDialog />
</template>

<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { storeToRefs } from "pinia";
import Steps from "primevue/steps";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import ScrollPanel from "primevue/scrollpanel";
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

const initLeftWidth = 325;
const leftInitWidthRatio = (initLeftWidth / window.innerWidth) * 100;
const rightInitWidthRatio = ((window.innerWidth - initLeftWidth - 2) / window.innerWidth) * 100;
</script>

<style lang="scss">
.app-content-height {
  height: calc(100vh - 59px);
}
</style>
