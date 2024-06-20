<template>
  <div class="relative flex size-full flex-col bg-[--p-content-background] pb-10">
    <div class="flex justify-between gap-2 px-2 py-1">
      <div class="flex gap-[2px]">
        <Tooltip>
          <template #trigger>
            <IconButton icon="pi pi-folder-open" @click="openInExplorer" />
          </template>
          <template #popover>Open in explorer</template>
        </Tooltip>
        <Tooltip>
          <template #trigger>
            <IconButton v-if="showSave" icon="pi pi-save" @click="openSaveDialog" />
          </template>
          <template #popover>Save</template>
        </Tooltip>
      </div>
      <div class="flex gap-[2px]">
        <div>
          <ExplorerShortcutTooltip />
          <IconButton icon="pi pi-filter" @click="menu.toggle($event)" />
          <Menu ref="menu" :model="items" :popup="true" :pt="{ root: { style: { transform: 'translateX(-165px)' } } }">
            <template #item="{ item, props: slotProps }">
              <div class="flex" :class="{ 'active-menu-item': item.key === storyTypeFilter }" v-bind="slotProps.action">
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
            <slot name="story-display" :label="node.label" :data="node.data">
              {{ node.label }}
            </slot>
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
import Menu from "primevue/menu";
import { ref } from "vue";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import { watchDebounced } from "@vueuse/core";
import ScrollPanel from "primevue/scrollpanel";
import IconButton from "../../general/IconButton.vue";
import StyledTree from "../../general/tree/StyledTree.vue";
import { isLeaf } from "../../general/tree/tree-helper";
import Tooltip from "../../general/Tooltip.vue";
import ExplorerShortcutTooltip from "../ExplorerShortcutTooltip.vue";
import type { StoryMetadataInScreenshotPageExplorer } from "./helper";
import type { NodeData } from "../../general/tree/type";
import type { StoryTypeFilter } from "../../../composables/useStoryExplorer";

const expandedKeys = defineModel<Set<string>>("expandedKeys", { required: true });
const highlightKey = defineModel<string | null>("highlightKey", { required: true });
const storyTypeFilter = defineModel<StoryTypeFilter>("storyTypeFilter", { required: true });
const searchText = defineModel<string>("searchText", { required: true });

const props = defineProps<{
  treeData: NodeData[];
  showSave: boolean;
  openInExplorer: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  handleSelectStory: (id: string) => Promise<void>;
  openSaveDialog?: () => void;
}>();

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "story-display"(props: { label: string; data: any }): unknown;
}>();

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
  const data: StoryMetadataInScreenshotPageExplorer | undefined = node.data;
  if (data) {
    props.handleSelectStory(data.id);
  }
};
</script>

<style lang="scss" scoped>
.active-menu-item {
  color: var(--p-primary-color) !important;
}

.scroll-panel-height {
  height: calc(100vh - 140px);
}
</style>
