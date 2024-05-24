<template>
  <ul class="flex flex-col">
    <TreeNode v-for="node in props.data" :key="node.key" :node="node" @node-click="handleNodeClick">
      <template #node-content="slotProps">
        <slot name="node-content" :node="slotProps.node"></slot>
      </template>
    </TreeNode>
  </ul>
</template>

<script setup lang="ts">
import { ref, provide, readonly } from "vue";
import TreeNode from "./TreeNode.vue";
import { isLeaf } from "./tree-helper";
import type { EmitEvent, NodeData, NodeSlots } from "./type";

const highlightKeyModel = defineModel<string | null>("highlightKey");
const expandedKeysModel = defineModel<Set<string>>("expandedKeys");

const props = defineProps<{
  data: NodeData[];
}>();

defineSlots<NodeSlots>();

const emit = defineEmits<EmitEvent>();

// handle controlled or uncontrolled state
const highlightKey = highlightKeyModel.value !== undefined ? highlightKeyModel : ref<null | string>(null);
const expandedKeys = expandedKeysModel.value !== undefined ? expandedKeysModel : ref(new Set<string>());

provide("expandedKeys", readonly(expandedKeys));
provide("highlightKey", readonly(highlightKey));

function handleNodeClick(node: NodeData) {
  toggleKey(node);
  highlightKey.value = node.key;
  emit("nodeClick", node);
}

function toggleKey(node: NodeData) {
  if (isLeaf(node)) return;
  const key = node.key;
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key);
  } else {
    expandedKeys.value.add(key);
  }
}
</script>
