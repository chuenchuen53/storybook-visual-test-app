import { computed, ref } from "vue";
import { generateTreeFromList, getStoryExplorerTreeData } from "../components/shared/story-explorer/helper";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import type { StoryMetadataInScreenshotPageExplorer } from "../components/shared/story-explorer/helper";
import type { ComputedRef, Ref } from "vue";
import type { StoryMetadata } from "../../shared/type";
import type { NodeData } from "../components/general/tree/type";

export type StoryTypeFilter = "all" | "error";

export interface BaseStoryMetadata extends StoryMetadata {
  storyErr: boolean | null;
}

interface UseStoryExplorerReturn<T extends BaseStoryMetadata> {
  treeData: ComputedRef<NodeData[]>;
  totalStoriesCount: ComputedRef<number>;
  searchText: Ref<string>;
  storyTypeFilter: Ref<StoryTypeFilter>;
  highlightKey: Ref<string | null>;
  expandedKeys: Ref<Set<string>>;
  reset: () => void;
  replaceBackingData: (data: T[]) => void;
  getDataById: (id: string) => T | null;
  updateItem: (id: string, newItem: Partial<T>) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export function useStoryExplorer<T extends BaseStoryMetadata>(): UseStoryExplorerReturn<T> {
  const _backingData: Ref<T[] | null> = ref(null);

  // a map of id to index of _metadata for faster search
  const _idToIndexMap = new Map<string, number>();
  const totalStoriesCount = computed(() => _backingData.value?.length ?? 0);

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
    return getStoryExplorerTreeData(generateTreeFromList(filteredData));
  });

  const reset = () => {
    _idToIndexMap.clear();
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = null;
    searchText.value = "";
    storyTypeFilter.value = "all";
  };

  const replaceBackingData = (data: T[]) => {
    _idToIndexMap.clear();
    data.forEach((x, index) => {
      _idToIndexMap.set(x.id, index);
    });
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = data;
  };

  const getDataById = (id: string): T | null => {
    if (!_backingData.value) return null;
    const index = _idToIndexMap.get(id);
    return index === undefined ? null : _backingData.value[index] ?? null;
  };

  const updateItem = (id: string, updateItem: Partial<StoryMetadataInScreenshotPageExplorer>) => {
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
    totalStoriesCount,
    reset,
    replaceBackingData,
    getDataById,
    updateItem,
    expandAll,
    collapseAll,
  };
}
