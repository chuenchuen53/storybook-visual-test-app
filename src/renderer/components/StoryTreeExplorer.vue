<template>
  <div class="relative flex h-full flex-col bg-[--p-content-background]">
    <div class="flex justify-between gap-2 px-2">
      <div>
        <Button
          v-tooltip.bottom="'Open in explorer'"
          icon="pi pi-folder-open"
          severity="secondary"
          text
          rounded
          size="small"
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
          size="small"
          @click="openSaveDialog"
        />
      </div>
      <div class="flex gap-2">
        <Button
          icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"
          severity="secondary"
          text
          rounded
          size="small"
          @click="expandAll"
        />
        <Button
          icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"
          severity="secondary"
          text
          rounded
          size="small"
          @click="collapseAll"
        />
        <div>
          <Button icon="pi pi-filter" severity="secondary" text rounded size="small" @click="toggle" />
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
      </div>
    </div>
    <Tree
      v-model:expandedKeys="expandedKeys"
      v-model:selection-keys="selectedKey"
      :value="nodes"
      class="scrollbar-hide overflow-y-auto"
      selection-mode="single"
      :filter="true"
      filter-mode="lenient"
      filter-placeholder="Find story"
      :pt="{
        root: {
          style: {
            fontSize: '14px',
            background: 'none',
            paddingTop: '0',
          },
        },
        nodetogglebutton: {
          style: {
            width: '22px',
            height: '22px',
          },
        },
        pcFilterIconContainer: {
          style: {
            top: '45%',
          },
        },
        wrapper: {
          style: {
            marginTop: '16px',
          },
        },
        nodeToggleIcon: {
          style: {
            width: '10px',
            height: '10px',
          },
        },
        nodelabel: {
          style: {
            flex: '100%',
          },
        },
      }"
      @node-select="onNodeSelect"
    >
      <template #default="{ node }">
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
    </Tree>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Tree from "primevue/tree";
import Button from "primevue/button";
import Menu from "primevue/menu";
import { computed, ref } from "vue";
import { isLeftNode, treeNodesForPrimevue, treeOfStoryMetadata } from "../utils";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import { ScreenshotState, StoryState } from "../../shared/type";
import type { StoryTree } from "../utils";
import type { TreeNode } from "primevue/treenode";
import type { TreeExpandedKeys } from "primevue/tree";

const store = useScreenshotStore();
const { metadata, storyTypeFilter, state } = storeToRefs(store);
const { setStoryTypeFilter, updateDisplayingImg, openInExplorer, openSaveDialog } = store;

const nodes = computed(() => {
  return metadata.value === null
    ? []
    : treeNodesForPrimevue<StoryTree>(treeOfStoryMetadata(metadata.value), isLeftNode);
});

const expandedKeys = ref<TreeExpandedKeys>({});
const selectedKey = ref(null);

const expandNode = (node: TreeNode) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

const expandAll = () => {
  for (let node of nodes.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};

const collapseAll = () => {
  expandedKeys.value = {};
};

const onNodeSelect = (node: TreeNode) => {
  if (node.data) {
    updateDisplayingImg(node.data.id);
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

const toggle = event => {
  menu.value.toggle(event);
};
</script>

<style lang="scss">
.p-tree-node-leaf .p-tree-node-toggle-button {
  display: none;
}

.active-menu-item {
  color: var(--p-primary-color) !important;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
