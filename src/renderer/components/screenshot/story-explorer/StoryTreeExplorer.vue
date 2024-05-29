<template>
  <div class="relative flex size-full flex-col bg-[--p-content-background] pb-10">
    <div class="flex justify-between gap-2 px-2 py-1">
      <div class="flex gap-[2px]">
        <IconButton v-tooltip.right="'Open in explorer'" icon="pi pi-folder-open" @click="openInExplorer" />
        <IconButton
          v-if="state === ScreenshotState.FINISHED"
          v-tooltip.bottom="'Save'"
          icon="pi pi-save"
          @click="saveDialogOpen = true"
        />
      </div>
      <div class="flex gap-[2px]">
        <div>
          <IconButton icon="pi pi-filter" @click="menu.toggle($event)" />
          <Menu ref="menu" :model="items" :popup="true" :pt="{ root: { style: { transform: 'translateX(-165px)' } } }">
            <template #item="{ item, props }">
              <div class="flex" :class="{ 'active-menu-item': item.key === storyTypeFilter }" v-bind="props.action">
                <span :class="item.icon" />
                <span class="ml-1">{{ item.label }}</span>
              </div>
            </template>
          </Menu>
        </div>
        <IconButton icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" @click="expandAll" />
        <IconButton icon="pi pi-arrow-down-left-and-arrow-up-right-to-center" @click="collapseAll" />
      </div>
    </div>
    <IconField class="mx-3 mb-2">
      <InputIcon class="pi pi-search" />
      <InputText v-model="search" placeholder="Search" class="w-full" />
    </IconField>
    <ScrollPanel class="scroll-panel-height">
      <StyledTree
        v-model:expandedKeys="expandedKeys"
        v-model:highlightKey="highlightKey"
        :data="treeData"
        class="px-3 pb-8 pt-2 text-sm"
        @node-click="onNodeSelect"
      >
        <template #node-content="{ node }">
          <div v-if="isLeaf(node)">
            <div class="flex items-baseline justify-between gap-2">
              <div class="flex gap-2">
                <i class="!text-sm" :class="iconCls(node.data.state)"></i>
                <div>
                  {{ node.label }}
                </div>
                <i v-if="node.data.storyErr" class="pi pi-exclamation-triangle !text-s text-red-400"></i>
              </div>
              <div v-if="node.data.startTime && node.data.endTime" class="text-xs text-gray-500">
                {{ timeSpent(node.data.startTime, node.data.endTime) }}ms
              </div>
            </div>
          </div>
          <div v-else>
            {{ node.label }}
          </div>
        </template>
      </StyledTree>
    </ScrollPanel>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Menu from "primevue/menu";
import { ref } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { watchDebounced } from "@vueuse/core";
import ScrollPanel from "primevue/scrollpanel";
import IconButton from "../../general/IconButton.vue";
import { useScreenshotStore } from "../../../stores/ScreenshotStore";
import { ScreenshotState, StoryState } from "../../../../shared/type";
import StyledTree from "../../general/tree/StyledTree.vue";
import { isLeaf } from "../../general/tree/tree-helper";
import { timeSpent } from "../../../utils/time-utils";
import type { StoryMetadataInExplorer } from "./helper";
import type { NodeData } from "../../general/tree/type";

const store = useScreenshotStore();
const { saveDialogOpen, treeData, expandedKeys, highlightKey, storyTypeFilter, state, searchText } = storeToRefs(store);
const { handleSelectStory, openInExplorer, expandAll, collapseAll } = store;

const search = ref("");

watchDebounced(
  search,
  value => {
    searchText.value = value;
  },
  {
    debounce: 300,
    maxWait: 1000,
  },
);

const menu = ref();
const items = ref([
  {
    label: "Story type",
    items: [
      {
        key: "all",
        label: "All",
        icon: "pi pi-list",
        command: () => (storyTypeFilter.value = "all"),
      },
      {
        key: "error",
        label: "Error Stories",
        icon: "pi pi-exclamation-triangle",
        command: () => (storyTypeFilter.value = "error"),
      },
    ],
  },
]);

const onNodeSelect = (node: NodeData) => {
  const data: StoryMetadataInExplorer | undefined = node.data;
  if (data) {
    handleSelectStory(data.id);
  }
};

function iconCls(state: StoryState): string {
  switch (state) {
    case StoryState.WAITING:
      return "pi pi-hourglass opacity-50";
    case StoryState.CAPTURING:
      return "pi pi-camera text-green-400 animate-pulse";
    case StoryState.FINISHED:
      return "pi pi-check-circle text-green-400";
  }
}
</script>

<style lang="scss">
.active-menu-item {
  color: var(--p-primary-color) !important;
}

.scroll-panel-height {
  height: calc(100vh - 140px);
}
</style>
