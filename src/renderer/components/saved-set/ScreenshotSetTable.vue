<template>
  <div class="ref-test-data-table-container">
    <TreeTable
      v-model:expandedKeys="expandedKeys"
      :value="localData"
      size="small"
      class="ref-test-data-table"
      :filters="filters"
      filter-mode="lenient"
    >
      <template #empty>
        <div class="py-2">No saved set.</div>
      </template>
      <Column header="Branch / Set Name" expander>
        <template #body="{ node }">
          <div v-if="node.data">
            {{ labelDisplay(node.data) }}
          </div>
          <div v-else>{{ node.label }}</div>
        </template>
      </Column>
      <Column field="createdAt" header="Created At">
        <template #body="{ node }">
          <div>{{ createdAtDisplay(node.data) }}</div>
        </template>
      </Column>
      <Column field="viewport" header="Viewport">
        <template #body="{ node }">
          <span>{{ viewportDisplay(node.data) }}</span>
        </template>
      </Column>
      <Column field="stories" header="Stories">
        <template #body="{ node }">
          <span>{{ storyNumberDisplay(node.data) }}</span>
          <span v-if="errStoryNumberDisplay(node.data)" class="text-xs text-[var(--p-button-text-danger-color)]"
            >({{ errStoryNumberDisplay(node.data) }})</span
          >
        </template>
      </Column>
      <Column header="Size">
        <template #body="{ node }">
          <div>{{ fileSizeDisplay(node.data) }}</div>
        </template>
      </Column>
      <Column field="actions" header="Actions">
        <template #body="{ node }">
          <div v-if="node.data" class="flex h-[21px] items-center space-x-2">
            <IconButton
              severity="primary"
              :wrapper-size="28"
              :icon-size="16"
              icon="pi pi-eye"
              @click="$emit('viewSet', node.data)"
            />
            <IconButton
              severity="danger"
              :wrapper-size="28"
              :icon-size="14"
              icon="pi pi-trash"
              @click="confirmDelSet($event, node.data)"
            />
          </div>
          <div v-else class="flex h-[21px] items-center space-x-2">
            <IconButton
              class="ml-[36px]"
              severity="danger"
              :wrapper-size="28"
              :icon-size="14"
              icon="pi pi-trash"
              @click="confirmDelBranch($event, node.label)"
            />
          </div>
        </template>
      </Column>
    </TreeTable>
  </div>
</template>

<script setup lang="ts">
import TreeTable from "primevue/treetable";
import Column from "primevue/column";
import dayjs from "dayjs";
import { ref, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import IconButton from "../general/IconButton.vue";
import type { TreeNode } from "primevue/treenode";
import type { SavedScreenshotSetInfo } from "../../../shared/type";

const confirm = useConfirm();

const props = defineProps<{
  data: TreeNode[];
}>();

const emit = defineEmits<{
  viewSet: [data: SavedScreenshotSetInfo];
  delSet: [data: SavedScreenshotSetInfo];
  delBranch: [branch: string];
}>();

const localData = ref<any>(null);

const filters = ref({});

const expandedKeys = ref<any>({});

const expandNode = (node: TreeNode) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key!] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};

const expandAll = () => {
  expandedKeys.value = {};

  for (let node of props.data) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};

watch(
  () => props.data,
  () => {
    localData.value = props.data;

    expandAll();
  },
  { immediate: true },
);

function labelDisplay(x?: SavedScreenshotSetInfo) {
  return x?.name ?? "";
}

function viewportDisplay(x?: SavedScreenshotSetInfo) {
  return x ? `${x.viewport.width}x${x.viewport.height}` : "";
}

function createdAtDisplay(x?: SavedScreenshotSetInfo) {
  return x ? dayjs(x.createdAt).format("DD/MM/YYYY HH:mm") : "";
}

function fileSizeDisplay(x?: SavedScreenshotSetInfo) {
  if (!x) return "";
  const kb = x.fileSize / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
}

function storyNumberDisplay(x?: SavedScreenshotSetInfo) {
  return x ? `${x.stories}` : "";
}

function errStoryNumberDisplay(x?: SavedScreenshotSetInfo) {
  return x ? x.errStories : "";
}

const rejectProps = {
  label: "Cancel",
  severity: "secondary",
  outlined: true,
};

const acceptProps = {
  label: "Delete",
  severity: "danger",
};

const confirmDelSet = (event: Event, data: SavedScreenshotSetInfo) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Do you want to delete this set?",
    icon: "pi pi-info-circle",
    rejectProps,
    acceptProps,
    accept: () => {
      emit("delSet", data);
    },
    reject: () => {},
  });
};

const confirmDelBranch = (event: Event, branch: string) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Do you want to delete this branch?",
    icon: "pi pi-info-circle",
    rejectProps,
    acceptProps,
    accept: () => {
      emit("delBranch", branch);
    },
    reject: () => {},
  });
};
</script>

<style lang="scss">
.ref-test-data-table-container {
  background: var(--p-content-background);
  padding: 8px 12px 16px;
  border-radius: 10px;
}

.ref-test-data-table {
  .p-treetable-thead > tr > th {
    font-size: 14px !important;
    padding: 10px 8px !important;
  }

  .p-treetable-tbody > tr > td {
    font-size: 14px !important;
    padding: 2px 8px !important;
  }

  .p-treetable-node-toggle-button svg {
    width: 12px !important;
    height: 12px !important;
  }
}
</style>
