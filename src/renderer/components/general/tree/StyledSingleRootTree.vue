<template>
  <div class="flex flex-col">
    <div class="flex justify-between gap-2">
      <div
        v-ripple
        class="root-node-content flex flex-grow cursor-pointer items-center gap-2 rounded p-1"
        :class="{ highlighted: highlightKeyModel === data.key }"
        @click="toggleTreeVisibility"
      >
        <div
          class="flex flex-shrink-0 flex-grow-0 basis-4 items-center justify-center"
          :class="{ invisible: isLeafNode }"
        >
          <i :class="expandedKeysModel.has(data.key) ? 'pi pi-angle-down' : 'pi pi-angle-right'"></i>
        </div>
        <div class="flex-shrink flex-grow basis-full select-none font-semibold uppercase tracking-widest">
          {{ data.label }}
        </div>
      </div>
      <div class="flex gap-[2px]" :class="{ invisible: isLeafNode }">
        <IconButton icon="pi pi-arrow-up-right-and-arrow-down-left-from-center" @click="expandAll" />
        <IconButton icon="pi pi-arrow-down-left-and-arrow-up-right-to-center" @click="collapseAll" />
      </div>
    </div>
    <TransitionCollapse>
      <Tree
        v-show="expandedKeys.has(data.key)"
        v-model:expanded-keys="expandedKeysModel"
        v-model:highlight-key="highlightKeyModel"
        :data="props.data.children"
        @node-click="handleNodeClick"
      >
        <template #node-content="{ node }">
          <slot name="node-content" :node="node"></slot>
        </template>
      </Tree>
    </TransitionCollapse>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import IconButton from "../IconButton.vue";
import TransitionCollapse from "../TransitionCollapse.vue";
import Tree from "./Tree.vue";
import { checkSingleBranchAndGetLeaf, getAllNonLeafKeys, isLeaf } from "./tree-helper";
import type { EmitEvent, NodeData, NodeSlots } from "./type";

const highlightKeyModel = defineModel<string | null>("highlightKey", { required: true });
const expandedKeysModel = defineModel<Set<string>>("expandedKeys", { required: true });

const props = defineProps<{
  data: NodeData;
}>();

defineSlots<NodeSlots>();

const emit = defineEmits<EmitEvent>();

const isLeafNode = computed(() => isLeaf(props.data));

function toggleTreeVisibility() {
  highlightKeyModel.value = props.data.key;
  if (expandedKeysModel.value.has(props.data.key)) {
    expandedKeysModel.value.delete(props.data.key);
  } else {
    expandedKeysModel.value.add(props.data.key);
  }
}

function expandAll() {
  const allNonLeafKeys = getAllNonLeafKeys(props.data);
  for (const key of allNonLeafKeys) {
    expandedKeysModel.value.add(key);
  }
}

function collapseAll() {
  const allNonLeafKeys = getAllNonLeafKeys(props.data);
  const sizeBefore = expandedKeysModel.value.size;
  for (let i = 1; i < allNonLeafKeys.length; i++) {
    const key = allNonLeafKeys[i];
    expandedKeysModel.value.delete(key);
  }
  if (sizeBefore === expandedKeysModel.value.size) {
    expandedKeysModel.value.delete(allNonLeafKeys[0]);
  }
}

function handleNodeClick(node: NodeData) {
  emit("nodeClick", node);
  autoExpandSingleBranch(node);
}

function autoExpandSingleBranch(node: NodeData) {
  if (isLeaf(node)) return;
  if (!expandedKeysModel.value.has(node.key)) return;

  const { isSingleBranch, leafKey, nonLeafKeys, leafNode } = checkSingleBranchAndGetLeaf(node);
  if (isSingleBranch) {
    for (const key of nonLeafKeys) {
      expandedKeysModel.value.add(key);
    }
    highlightKeyModel.value = leafKey;
    emit("nodeClick", leafNode);
  }
}
</script>

<style scoped lang="scss">
@use "./style.scss" as *;

.root-node-content {
  @include hover-and-highlight-effect;
}
</style>
