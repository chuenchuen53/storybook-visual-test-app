<template>
  <li :class="{ 'pl-2': !isRoot }">
    <div
      class="tree-node-wrapper flex cursor-pointer gap-x-2 rounded p-1 transition-all"
      :class="{ highlighted: highlightKey === node.key }"
      @click="$emit('nodeClicked', node)"
    >
      <div class="flex h-5 flex-shrink-0 flex-grow-0 basis-4 items-center justify-center">
        <i
          v-if="node.children?.length > 0"
          class="!text-[14px]"
          :class="expandedKeys.includes(node.key) ? 'pi pi-angle-down' : 'pi pi-angle-right'"
        ></i>
      </div>
      <div class="flex-shrink flex-grow basis-full select-none">
        <slot name="node-content" :node="node">
          {{ node.label }}
        </slot>
      </div>
    </div>
    <ul v-if="expandedKeys && expandedKeys.includes(node.key)" class="mt-1 flex flex-col gap-1">
      <tree-node
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :is-root="false"
        @node-clicked="x => $emit('nodeClicked', x)"
      >
        <template #node-content="slotProps">
          <slot name="node-content" :node="slotProps.node"> </slot>
        </template>
      </tree-node>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { inject } from "vue";
import type { Ref } from "vue";
import type { NodeData } from "./type";

defineProps<{
  node: NodeData;
  isRoot: boolean;
}>();

defineSlots<{
  "node-content"(props: { node: NodeData }): unknown;
}>();

defineEmits(["nodeClicked"]);

const expandedKeys = inject<Ref<string[]>>("expandedKeys");
const highlightKey = inject<string>("highlightKey");
</script>

<style scoped lang="scss">
.tree-node-wrapper {
  &:hover {
    color: var(--p-text-hover-color);
    background-color: var(--p-content-hover-background);
  }

  &.highlighted,
  &.highlighted:hover {
    color: var(--p-highlight-color);
    background: var(--p-highlight-background);
  }
}
</style>
