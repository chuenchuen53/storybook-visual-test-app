<template>
  <li>
    <div
      v-ripple
      class="tree-node-wrapper flex cursor-pointer gap-x-2 rounded p-1 transition-all"
      :class="{ highlighted: highlightKey === node.key }"
      @click="$emit('nodeClick', node)"
    >
      <div class="flex flex-shrink-0 flex-grow-0 basis-4 items-center justify-center">
        <i v-if="!isLeaf(node)" :class="expandedKeys?.has(node.key) ? 'pi pi-angle-down' : 'pi pi-angle-right'"></i>
      </div>
      <div class="flex-shrink flex-grow basis-full select-none">
        <slot name="node-content" :node="node">
          {{ node.label }}
        </slot>
      </div>
    </div>
    <ul v-if="expandedKeys?.has(node.key)" class="flex flex-col">
      <TreeNode
        v-for="childNode in node.children"
        :key="childNode.key"
        class="pl-2"
        :node="childNode"
        @node-click="$emit('nodeClick', $event)"
      >
        <template #node-content="slotProps">
          <slot name="node-content" :node="slotProps.node"></slot>
        </template>
      </TreeNode>
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { inject } from "vue";
import { isLeaf } from "./tree-helper";
import type { EmitEvent, NodeData, NodeSlots } from "./type";

defineProps<{
  node: NodeData;
}>();

defineSlots<NodeSlots>();

defineEmits<EmitEvent>();

const expandedKeys = inject<Ref<Set<string>>>("expandedKeys");
const highlightKey = inject<string | null>("highlightKey");
</script>

<style scoped lang="scss">
@use "./style.scss" as *;

.tree-node-wrapper {
  @include hover-and-highlight-effect;
}
</style>
