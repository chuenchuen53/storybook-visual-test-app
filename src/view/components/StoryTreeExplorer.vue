<template>
  <div class="flex h-full flex-col bg-[--p-content-background]">
    <Tree
      v-model:expandedKeys="expandedKeys"
      v-model:selection-keys="selectedKey"
      :value="nodes"
      class="overflow-y-auto"
      selection-mode="single"
      :filter="true"
      filter-mode="lenient"
      filter-placeholder="Find story"
      :pt="{
        root: {
          style: {
            fontSize: '14px',
          },
        },
        nodetogglebutton: {
          style: {
            width: '22px',
            height: '22px',
          },
        },
      }"
      @node-select="onNodeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Tree from "primevue/tree";
import Button from "primevue/button";
import { computed, onMounted, ref } from "vue";
import { head } from "shelljs";
import { treeNodesForPrimevue, treeOfStoryMetadata } from "../utils";
import { StoryMetadata } from "../../service/crawler/type";
import { useScreenshotStore } from "../stores/ScreenshotStore";
import type { TreeNode } from "primevue/treenode";
import type { TreeExpandedKeys } from "primevue/tree";

const store = useScreenshotStore();
const { metadata } = storeToRefs(store);

const nodes = computed(() => {
  return metadata.value === null ? [] : treeNodesForPrimevue(treeOfStoryMetadata(metadata.value));
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
  if (!node.children) {
    console.log(node.key);
  }
};
</script>
