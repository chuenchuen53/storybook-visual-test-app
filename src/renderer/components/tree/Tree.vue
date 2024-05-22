<template>
  <div>
    <ul class="flex flex-col gap-1">
      <tree-node
        v-for="node in props.data"
        :key="node.key"
        :node="node"
        :is-root="true"
        @node-clicked="handleNodeClick"
      >
        <template #node-content="slotProps">
          <slot name="node-content" :node="slotProps.node"></slot>
        </template>
      </tree-node>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watchEffect } from "vue";
import TreeNode from "./TreeNode.vue";
import type { NodeData } from "./type";

const props = defineProps<{
  data: NodeData[];
  onNodeClick?: (node: NodeData) => void;
  highlightKey?: string;
}>();

defineSlots<{
  "node-content"(props: { node: NodeData }): unknown;
}>();

const expandedKeys = ref<string[]>([]);
const highlightKey = ref(props.highlightKey);

provide("expandedKeys", expandedKeys);
provide("highlightKey", highlightKey);

watchEffect(() => {
  highlightKey.value = props.highlightKey;
});

function handleNodeClick(node: NodeData) {
  toggleKey(node);
  props.onNodeClick?.(node);
}

function toggleKey(node: NodeData) {
  if ((node.children?.length ?? 0) === 0) return;
  const key = node.key;
  const index = expandedKeys.value.indexOf(key);
  if (index === -1) {
    expandedKeys.value.push(key);
  } else {
    expandedKeys.value.splice(index, 1);
  }
}
</script>
