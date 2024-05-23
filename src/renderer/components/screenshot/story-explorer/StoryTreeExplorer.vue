<template>
  <div class="relative flex h-full flex-col bg-[--p-content-background] pb-10">
    <div class="flex justify-between gap-2 px-2 py-1">
      <div class="flex gap-[2px]">
        <Button
          v-tooltip.bottom="'Open in explorer'"
          class="icon-btn"
          icon="pi pi-folder-open"
          severity="secondary"
          text
          rounded
          @click="openInExplorer"
        />
        <Button
          v-if="state === ScreenshotState.FINISHED"
          v-tooltip.bottom="'Save'"
          :disabled="false"
          icon="pi pi-save"
          severity="secondary"
          text
          rounded
          class="icon-btn"
          @click="openSaveDialog"
        />
      </div>
      <div class="flex gap-[2px]">
        <div>
          <Button icon="pi pi-filter" severity="secondary" text rounded class="icon-btn" @click="toggle" />
          <Menu ref="menu" :model="items" :popup="true" :pt="{ root: { style: { transform: 'translateX(-165px)' } } }">
            <template #item="{ item, props }">
              <div
                class="align-center flex"
                :class="{ 'active-menu-item': item.key === storyTypeFilter }"
                v-bind="props.action"
              >
                <span :class="item.icon" />
                <span class="ml-2">{{ item.label }}</span>
              </div>
            </template>
          </Menu>
        </div>
        <Button
          icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"
          severity="secondary"
          text
          rounded
          class="icon-btn"
          @click="expandAll"
        />
        <Button
          icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"
          severity="secondary"
          text
          rounded
          class="icon-btn"
          @click="collapseAll"
        />
      </div>
    </div>
    <StyledTree
      v-model:expandedKeys="expandedKeys"
      v-model:highlightKey="highlightKey"
      :data="nodes"
      class="scrollbar-hide overflow-y-auto px-3 py-2 text-sm"
      @node-click="onNodeSelect"
    >
      <template #node-content="{ node }">
        <div v-if="!node.children && typeof node.data === 'object'">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <i :class="iconCls(node.data.state)" style="font-size: 14px"></i>
              <div>
                {{ node.label }}
              </div>
              <i v-if="node.data.storyErr" class="pi pi-exclamation-triangle text-red-400" style="font-size: 14px"></i>
            </div>
            <div v-if="node.data.startTime && node.data.endTime" class="text-xs text-gray-500">
              {{ timeSpent(node.data.startTime, node.data.endTime) }}ms
            </div>
          </div>
        </div>
        <div v-else>
          <div>{{ node.label }}</div>
        </div>
      </template>
    </StyledTree>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import Menu from "primevue/menu";
import { computed, ref } from "vue";
import { useScreenshotStore } from "../../../stores/ScreenshotStore";
import { ScreenshotState, StoryState } from "../../../../shared/type";
import StyledTree from "../../general/tree/StyledTree.vue";
import { getAllNonLeafKeys, checkSingleBranchAndGetLeaf } from "../../general/tree/tree-helper";
import { generateTreeFromFlatData } from "../../../utils/story-tree-utils";
import { getScreenshotPageTreeData } from "./helper";
import type { NodeData } from "../../general/tree/type";

const store = useScreenshotStore();
const { metadata, storyTypeFilter, state } = storeToRefs(store);
const { setStoryTypeFilter, updateDisplayingImg, openInExplorer, openSaveDialog } = store;

const nodes = computed(() => {
  console.log(metadata.value === null ? [] : getScreenshotPageTreeData(metadata.value as any));
  return metadata.value === null ? [] : getScreenshotPageTreeData(generateTreeFromFlatData(metadata.value));
});

const expandedKeys = ref(new Set<string>());
const highlightKey = ref<string | null>(null);

const onNodeSelect = (node: NodeData) => {
  if (node.data) {
    updateDisplayingImg(node.data.id);
  } else {
    if (expandedKeys.value.has(node.key)) {
      const { isSingleBranch, leafKey, nonLeafKeys } = checkSingleBranchAndGetLeaf(node);
      if (isSingleBranch) {
        for (const key of nonLeafKeys) {
          expandedKeys.value.add(key);
        }
        highlightKey.value = leafKey;
      }
    }
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
    case StoryState.FAILED:
      return "pi pi-times-circle text-red-400";
  }
}

function timeSpent(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diff = endTime.getTime() - startTime.getTime();
  return diff.toString();
}

const menu = ref();
const items = ref([
  {
    label: "Story type",
    items: [
      {
        key: "all",
        label: "All",
        icon: "pi pi-list",
        command: () => setStoryTypeFilter("all"),
      },
      {
        key: "error",
        label: "Error Stories",
        icon: "pi pi-exclamation-triangle",
        command: () => setStoryTypeFilter("error"),
      },
    ],
  },
]);

const toggle = (event: any) => {
  menu.value.toggle(event);
};

function expandAll() {
  const allKeys = nodes.value.map(node => getAllNonLeafKeys(node)).flat();
  for (const key of allKeys) {
    expandedKeys.value.add(key);
  }
}

function collapseAll() {
  expandedKeys.value.clear();
}
</script>

<style lang="scss">
.active-menu-item {
  color: var(--p-primary-color) !important;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

<style scoped lang="scss">
.icon-btn {
  padding: 0 !important;
  width: 32px !important;
  height: 32px !important;
  --p-icon-size: 12px;
}
</style>
