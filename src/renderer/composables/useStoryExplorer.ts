import { computed, ref } from "vue";
import { generateTreeFromList, getStoryExplorerTreeData } from "../components/shared/story-explorer/helper";
import { checkSingleBranchAndGetLeaf, getAllNonLeafKeys } from "../components/general/tree/tree-helper";
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
  selectedStory: Ref<T | null>;
  reset: () => void;
  replaceBackingData: (data: T[]) => void;
  getDataById: (id: string) => T | null;
  updateItem: (id: string, newItem: Partial<T>) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectPrevStory: (cb: (id: string) => Promise<void>) => Promise<void>;
  selectNextStory: (cb: (id: string) => Promise<void>) => Promise<void>;
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
  const selectedStory = ref<T | null>(null) as Ref<T | null>;

  const _filteredData = computed<T[]>(() => {
    if (_backingData.value === null) return [];
    const lowerCaseSearchText = searchText.value.toLowerCase();
    return _backingData.value.filter(
      item =>
        (storyTypeFilter.value === "all" || item.storyErr) &&
        (item.title.toLowerCase().includes(lowerCaseSearchText) ||
          item.name.toLowerCase().includes(lowerCaseSearchText)),
    );
  });

  const treeData = computed(() => getStoryExplorerTreeData(generateTreeFromList(_filteredData.value)));

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

  const _storyInFilteredData = (id: string): boolean => {
    return _filteredData.value.some(x => x.id === id);
  };

  const _getFirstStory = (): T | null => {
    if (_filteredData.value.length === 0) return null;
    return _filteredData.value[0];
  };

  const _getPrevStory = (curStoryId: string): T | null => {
    const curIndex = _filteredData.value.findIndex(x => x.id === curStoryId);
    if (curIndex === -1) return null;
    const prevIndex = curIndex - 1;
    if (prevIndex < 0) return null;
    return _filteredData.value[prevIndex];
  };

  const _getNextStory = (curStoryId: string): T | null => {
    const curIndex = _filteredData.value.findIndex(x => x.id === curStoryId);
    if (curIndex === -1) return null;
    const nextIndex = curIndex + 1;
    if (nextIndex >= _filteredData.value.length) return null;
    return _filteredData.value[nextIndex];
  };

  const _selectNode = (id: string) => {
    const data = getDataById(id);
    if (data) {
      const tree = getStoryExplorerTreeData(generateTreeFromList([{ ...data }]));
      const leaf = checkSingleBranchAndGetLeaf(tree[0]);
      if (leaf.isSingleBranch) {
        highlightKey.value = leaf.leafKey;
        const allNonLeafKeys = getAllNonLeafKeys(tree[0]);
        for (const key of allNonLeafKeys) {
          expandedKeys.value.add(key);
        }
        selectedStory.value = data;
      }
    }
  };

  const _selectFirstStory = async (cb: (id: string) => Promise<void>) => {
    const first = _getFirstStory();
    if (first) {
      const id = first.id;
      _selectNode(id);
      await cb(id);
    }
  };

  const selectPrevStory = async (cb: (id: string) => Promise<void>) => {
    if (selectedStory.value && _storyInFilteredData(selectedStory.value.id)) {
      const prev = _getPrevStory(selectedStory.value.id);
      if (prev) {
        const id = prev.id;
        _selectNode(id);
        await cb(id);
      }
    } else {
      await _selectFirstStory(cb);
    }
  };

  const selectNextStory = async (cb: (id: string) => Promise<void>) => {
    if (selectedStory.value && _storyInFilteredData(selectedStory.value.id)) {
      const next = _getNextStory(selectedStory.value.id);
      if (next) {
        const id = next.id;
        _selectNode(id);
        await cb(id);
      }
    } else {
      await _selectFirstStory(cb);
    }
  };

  return {
    searchText,
    storyTypeFilter,
    highlightKey,
    expandedKeys,
    treeData,
    selectedStory,
    totalStoriesCount,
    reset,
    replaceBackingData,
    getDataById,
    updateItem,
    expandAll,
    collapseAll,
    selectPrevStory,
    selectNextStory,
  };
}
