<template>
  <div class="relative flex h-full flex-col bg-[--p-content-background]">
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
        <IconButton icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" @click="expandAll" />
        <IconButton icon="pi pi-arrow-down-left-and-arrow-up-right-to-center" @click="collapseAll" />
      </div>
    </div>
    <IconField class="mx-3 mb-2">
      <InputIcon class="pi pi-search" />
      <InputText v-model="searchText" placeholder="Search" class="w-full" />
    </IconField>
    <SelectButton
      v-if="typeOptions"
      v-model="selectedType"
      :options="selectOptions"
      option-label="name"
      option-value="value"
      :allow-empty="false"
      class="w-full px-3 [&>*]:flex-grow"
    >
      <template #option="slotProps">
        <div class="text-nowrap text-[11px]">
          <span>
            {{ slotProps.option.name }}
          </span>
          <span v-if="shouldShowNumber(slotProps.option.value)" class="text-[9px] opacity-90">
            ({{ getNumber(slotProps.option.value) }})
          </span>
        </div>
      </template>
    </SelectButton>
    <ScrollPanel class="scroll-panel-height">
      <StyledTree
        v-model:expandedKeys="expandedKeys"
        v-model:highlightKey="highlightKey"
        :data="treeData ?? []"
        class="px-3 pb-8 pt-2 text-sm"
        @node-click="onNodeSelect"
      >
        <template #node-content="{ node }">
          <div v-if="isLeaf(node)">
            <div class="flex gap-2">
              <i class="pi pi-bookmark !text-sm text-primary"></i>
              <div>
                {{ node.label }}
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
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ScrollPanel from "primevue/scrollpanel";
import SelectButton from "primevue/selectbutton";
import Tooltip from "../../general/Tooltip.vue";
import StyledTree from "../../general/tree/StyledTree.vue";
import IconButton from "../../general/IconButton.vue";
import { isLeaf } from "../../general/tree/tree-helper";
import type { TypeOptions } from "../../../composables/useComparisonResultExplorer";
import type { ComparisonResultTreeLeaf } from "./helper";
import type { StoriesDiffResult } from "../../../../shared/type";
import type { NodeData } from "../../general/tree/type";

const expandedKeys = defineModel<Set<string>>("expandedKeys", { required: true });
const highlightKey = defineModel<string | null>("highlightKey", { required: true });
const selectedType = defineModel<keyof StoriesDiffResult>("selectedType", { required: true });
const searchText = defineModel<string>("searchText", { required: true });

const props = defineProps<{
  treeData: NodeData[] | null;
  openInExplorer: () => void;
  showSave: boolean;
  expandAll: () => void;
  collapseAll: () => void;
  typeOptions: TypeOptions;
  handleSelectStory: (data: ComparisonResultTreeLeaf) => Promise<void>;
  openSaveDialog?: () => void;
}>();

const selectOptions: { name: string; value: keyof StoriesDiffResult }[] = [
  { name: "Diff", value: "diff" },
  { name: "New", value: "added" },
  { name: "Del", value: "removed" },
  { name: "Same", value: "same" },
  { name: "Skip", value: "skip" },
];

const onNodeSelect = (node: NodeData) => {
  if (node.data) {
    const data: ComparisonResultTreeLeaf = node.data;
    props.handleSelectStory(data);
  }
};

const shouldShowNumber = (key: keyof StoriesDiffResult) => {
  return props.typeOptions[key] !== null;
};

const getNumber = (key: keyof StoriesDiffResult) => {
  return props.typeOptions[key];
};
</script>

<style lang="scss" scoped>
.scroll-panel-height {
  height: calc(100vh - 175px);
}
</style>
