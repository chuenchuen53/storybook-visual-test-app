<template>
  <div class="relative flex h-full flex-col bg-[--p-content-background]">
    <div class="flex justify-between gap-2 px-2 py-1">
      <div class="flex gap-[2px]">
        <IconButton v-tooltip.right="'Open in explorer'" icon="pi pi-folder-open" @click="openInExplorer" />
        <IconButton
          v-if="explorerTreeData"
          v-tooltip.bottom="'Save'"
          icon="pi pi-save"
          @click="saveDialogOpen = true"
        />
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
        <div class="text-nowrap text-xs">
          <span>
            {{ slotProps.option.name }}
          </span>
          <span class="text-[10px] text-gray-400"> ({{ typeOptions[slotProps.option.value] }}) </span>
        </div>
      </template>
    </SelectButton>

    <ScrollPanel class="scroll-panel-height">
      <StyledTree
        v-model:expandedKeys="expandedKeys"
        v-model:highlightKey="highlightKey"
        :data="explorerTreeData ?? []"
        class="px-3 pb-8 pt-2 text-sm"
        @node-click="onNodeSelect"
      >
      </StyledTree>
    </ScrollPanel>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import ScrollPanel from "primevue/scrollpanel";
import SelectButton from "primevue/selectbutton";
import StyledTree from "../../general/tree/StyledTree.vue";
import { useComparisonStore } from "../../../stores/ComparisonStore";
import IconButton from "../../general/IconButton.vue";
import type { ComparisonResultTreeLeaf } from "./helper";
import type { StoriesDiffResult } from "../../../../shared/type";
import type { NodeData } from "../../general/tree/type";

const store = useComparisonStore();

const { explorerTreeData, highlightKey, expandedKeys, saveDialogOpen, searchText, typeOptions, selectedType } =
  storeToRefs(store);
const { openInExplorer, expandAll, collapseAll, handleNodeSelect } = store;

const selectOptions: { name: string; value: keyof StoriesDiffResult }[] = [
  { name: "Diff", value: "diff" },
  { name: "Added", value: "added" },
  { name: "Removed", value: "removed" },
  { name: "Same", value: "same" },
];

const onNodeSelect = (node: NodeData) => {
  if (node.data) {
    const data: ComparisonResultTreeLeaf = node.data;
    handleNodeSelect(data);
  }
};
</script>

<style lang="scss">
.scroll-panel-height {
  height: calc(100vh - 140px);
}
</style>
