<template>
  <main class="size-full">
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <StoryTreeExplorer
          v-model:expanded-keys="expandedKeys"
          v-model:highlight-key="highlightKey"
          v-model:story-type-filter="storyTypeFilter"
          v-model:search-text="searchText"
          :tree-data="treeData"
          :show-save="state === ScreenshotState.FINISHED"
          :open-in-explorer="openInExplorer"
          :expand-all="expandAll"
          :collapse-all="collapseAll"
          :handle-select-story="handleSelectStory"
          :open-save-dialog="() => (saveDialogOpen = true)"
        >
          <template #story-display="{ label, data }">
            <StoryDisplayInExplorer :label="label" :data="data" />
          </template>
        </StoryTreeExplorer>
      </template>
      <template #right>
        <ScrollPanel class="app-content-height w-full overflow-hidden">
          <Accordion value="0">
            <AccordionPanel value="0">
              <AccordionHeader :pt="{ root: { style: { borderRadius: 0, padding: '8px 24px' } } }"
                >Settings & Progress
              </AccordionHeader>
              <AccordionContent :pt="{ content: { style: { padding: '24px' } } }">
                <div class="flex flex-wrap justify-evenly gap-8">
                  <ScreenshotSetting />
                  <ProgressIndicator class="w-[400px]" />
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
          <div class="w-full p-6">
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
import ScrollPanel from "primevue/scrollpanel";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";
import ScreenshotSetting from "../components/screenshot/ScreenshotSetting.vue";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import StoryTreeExplorer from "../components/shared/story-explorer/StoryTreeExplorer.vue";
import SaveDialog from "../components/screenshot/SaveDialog.vue";
import ScreenshotImg from "../components/screenshot/ScreenshotImg.vue";
import StoryDisplayInExplorer from "../components/screenshot/StoryDisplayInExplorer.vue";
import { ScreenshotState } from "../../shared/type";
import ProgressIndicator from "../components/screenshot/ProgressIndicator.vue";

const store = useScreenshotStore();
const { saveDialogOpen, treeData, expandedKeys, highlightKey, storyTypeFilter, state, searchText } = storeToRefs(store);
const { handleSelectStory, openInExplorer, expandAll, collapseAll } = store;
</script>

<style scoped>
.app-content-height {
  height: calc(100vh - 50px);
}
</style>
