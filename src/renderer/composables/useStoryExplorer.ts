import { computed, ref } from "vue";
import { getScreenshotPageTreeData } from "../components/screenshot/story-explorer/helper";
import { generateTreeFromFlatData } from "../utils/story-tree-utils";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import type { StoryMetadataInExplorer } from "../components/screenshot/story-explorer/helper";
import type { ComputedRef, Ref } from "vue";
import type { NodeData } from "../components/general/tree/type";

export type StoryTypeFilter = "all" | "error";

interface UseStoryExplorerReturn {
  treeData: ComputedRef<NodeData[]>;
  searchText: Ref<string>;
  storyTypeFilter: Ref<StoryTypeFilter>;
  highlightKey: Ref<string | null>;
  expandedKeys: Ref<Set<string>>;
  replaceBackingData: (data: StoryMetadataInExplorer[]) => void;
  getDataById: (id: string) => StoryMetadataInExplorer | null;
  updateItem: (id: string, newItem: Partial<StoryMetadataInExplorer>) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export function useStoryExplorer(): UseStoryExplorerReturn {
  const _backingData = ref<StoryMetadataInExplorer[] | null>(null);

  // a map of id to index of _metadata for faster search
  const _idToIndexMap = new Map<string, number>();

  const searchText = ref<string>("");
  const storyTypeFilter = ref<StoryTypeFilter>("all");
  const highlightKey = ref<string | null>(null);
  const expandedKeys = ref(new Set<string>());

  const treeData = computed(() => {
    if (_backingData.value === null) return [];
    const lowerCaseSearchText = searchText.value.toLowerCase();
    const filteredData = _backingData.value.filter(
      item =>
        (storyTypeFilter.value === "all" || item.storyErr) &&
        (item.title.toLowerCase().includes(lowerCaseSearchText) ||
          item.name.toLowerCase().includes(lowerCaseSearchText)),
    );
    return getScreenshotPageTreeData(generateTreeFromFlatData(filteredData));
  });

  const replaceBackingData = (data: StoryMetadataInExplorer[]) => {
    _idToIndexMap.clear();
    data.forEach((x, index) => {
      _idToIndexMap.set(x.id, index);
    });
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = data;
  };

  const getDataById = (id: string): StoryMetadataInExplorer | null => {
    if (!_backingData.value) return null;
    const index = _idToIndexMap.get(id);
    return index === undefined ? null : _backingData.value[index] ?? null;
  };

  const updateItem = (id: string, updateItem: Partial<StoryMetadataInExplorer>) => {
    const data = getDataById(id);
    if (!data) return;
    Object.assign(data, updateItem);
  };

  const expandAll = () => {
    const allKeys = treeData.value.map(node => getAllNonLeafKeys(node)).flat();
    for (const key of allKeys) {
      expandedKeys.value.add(key);
    }
  };

  const collapseAll = () => {
    expandedKeys.value.clear();
  };

  return {
    searchText,
    storyTypeFilter,
    highlightKey,
    expandedKeys,
    treeData,
    replaceBackingData,
    getDataById,
    updateItem,
    expandAll,
    collapseAll,
  };
}
