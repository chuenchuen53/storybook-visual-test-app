<template>
  <div class="flex flex-col">
    <div class="flex justify-between gap-2">
      <div
        class="root-node-content flex flex-grow cursor-pointer items-center gap-2 rounded p-1"
        :class="{ highlighted: highlightKeyModel === data.key }"
        @click="toggleTreeVisibility"
      >
        <div
          class="flex flex-shrink-0 flex-grow-0 basis-4 items-center justify-center"
          :class="{ invisible: isLeaf(data) }"
        >
          <i
            class="!text-[14px]"
            :class="expandedKeysModel.has(data.key) ? 'pi pi-angle-down' : 'pi pi-angle-right'"
          ></i>
        </div>
        <div class="flex-shrink flex-grow basis-full select-none font-semibold uppercase tracking-widest">
          {{ data.label }}
        </div>
      </div>
      <div class="flex gap-[2px]">
        <Button
          class="icon-btn"
          icon="pi pi-arrow-up-right-and-arrow-down-left-from-center"
          severity="secondary"
          text
          rounded
          @click="expandAll"
        />
        <Button
          class="icon-btn"
          icon="pi pi-arrow-down-left-and-arrow-up-right-to-center"
          severity="secondary"
          text
          rounded
          @click="collapseAll(false)"
          @dblclick="collapseAll(true)"
        />
      </div>
    </div>
    <TransitionCollapse>
      <Tree
        v-show="expandedKeys.has(data.key)"
        v-model:expanded-keys="expandedKeysModel"
        v-model:highlight-key="highlightKeyModel"
        :data="props.data.children"
        @node-click="emit('nodeClick', $event)"
      >
        <template #node-content="{ node }">
          <slot name="node-content" :node="node"></slot>
        </template>
      </Tree>
    </TransitionCollapse>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import TransitionCollapse from "../TransitionCollapse.vue";
import Tree from "./Tree.vue";
import { getAllNonLeafKeys, isLeaf } from "./tree-helper";
import type { EmitEvent, NodeData, NodeSlots } from "./type";

const highlightKeyModel = defineModel<string | null>("highlightKey", { required: true });
const expandedKeysModel = defineModel<Set<string>>("expandedKeys", { required: true });

const props = defineProps<{
  data: NodeData;
}>();

defineSlots<NodeSlots>();

const emit = defineEmits<EmitEvent>();

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

function collapseAll(includeSelf: boolean) {
  const allChildrenKeys = getAllNonLeafKeys(props.data);
  for (let i = includeSelf ? 0 : 1; i < allChildrenKeys.length; i++) {
    const key = allChildrenKeys[i];
    expandedKeysModel.value.delete(key);
  }
}
</script>

<style scoped lang="scss">
@use "./style.scss" as *;

.root-node-content {
  @include hover-and-highlight-effect;
}

.icon-btn {
  padding: 0 !important;
  width: 32px !important;
  height: 32px !important;
  --p-icon-size: 12px;
}
</style>
