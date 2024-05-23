<template>
  <div class="flex flex-col gap-4">
    <StyledSingleRootTree
      v-for="rootNode in data"
      :key="rootNode.key"
      v-model:highlight-key="highlightKeyModel"
      v-model:expanded-keys="expandedKeysModel"
      :data="rootNode"
      @node-click="emit('nodeClick', $event)"
    >
      <template #node-content="{ node }">
        <slot name="node-content" :node="node"></slot>
      </template>
    </StyledSingleRootTree>
  </div>
</template>

<script setup lang="ts">
import StyledSingleRootTree from "./StyledSingleRootTree.vue";
import type { EmitEvent, NodeData, NodeSlots } from "./type";

const highlightKeyModel = defineModel<string | null>("highlightKey", { required: true });
const expandedKeysModel = defineModel<Set<string>>("expandedKeys", { required: true });

defineProps<{
  data: NodeData[];
}>();

const emit = defineEmits<EmitEvent>();

defineSlots<NodeSlots>();
</script>
