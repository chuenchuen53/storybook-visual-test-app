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
          v-if="compareResult !== null"
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
    </Tree>
  </div>
</template>

<script setup lang="ts">
import Tree, { type TreeExpandedKeys } from "primevue/tree";
import Button from "primevue/button";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useCompareStore } from "../../stores/CompareStore";
import { isCompareResultLeaf, treeNodesForPrimevue, treeOfCompareResult } from "../../utils";
import type { CompareResultTree } from "../../utils";
import type { TreeNode } from "primevue/treenode";

const store = useCompareStore();

const { compareResult } = storeToRefs(store);
const {
  openInExplorer,
  getAddedImg,
  getRemovedImg,
  getSameImg,
  getDiffImg,
  setCurrentDisplayingImgType,
  openSaveDialog,
} = store;

const expandedKeys = ref<TreeExpandedKeys>({});
const selectedKey = ref(null);

const nodes = computed(() => {
  return compareResult.value === null
    ? []
    : treeNodesForPrimevue<CompareResultTree>(treeOfCompareResult(compareResult.value), isCompareResultLeaf);
});

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
    const storyId = node.data.storyId;
    const resultType = node.data.resultType;
    setCurrentDisplayingImgType(resultType);

    switch (resultType) {
      case "same":
        getSameImg(storyId);
        return;
      case "added":
        getAddedImg(storyId);
        return;
      case "removed":
        getRemovedImg(storyId);
        return;
      case "diff":
        getDiffImg(storyId);
        return;
    }
  }
};
</script>
