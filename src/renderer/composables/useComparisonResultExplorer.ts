import { computed, ref } from "vue";
import {
  generateResultTreeFromList,
  getCompareResultTreeData,
} from "../components/shared/comparison-result-explorer/helper";
import { checkSingleBranchAndGetLeaf, getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import { filterNonNull } from "../utils";
import type { ComparisonResultTreeLeaf } from "../components/shared/comparison-result-explorer/helper";
import type { ComputedRef, Ref } from "vue";
import type { TempComparisonMetadata, StoriesDiffResult, StoryMetadataWithRenderStatus } from "../../shared/type";
import type { NodeData } from "../components/general/tree/type";

export interface ComparisonSetSummary {
  project: string;
  refBranch: string;
  refSetId: string;
  refSetName: string;
  testBranch: string;
  testSetId: string;
  testSetName: string;
  resultSummary: Record<keyof StoriesDiffResult, number>;
}

export type TypeOptions = Record<keyof StoriesDiffResult, number | null>;

export interface UseComparisonResultExplorerReturn {
  treeData: ComputedRef<NodeData[] | null>;
  searchText: Ref<string>;
  typeOptions: ComputedRef<TypeOptions>;
  selectedType: Ref<keyof StoriesDiffResult>;
  highlightKey: Ref<string | null>;
  selectedStory: Ref<ComparisonResultTreeLeaf | null>;
  isNullResult: ComputedRef<boolean>;
  expandedKeys: Ref<Set<string>>;
  comparisonSetSummary: ComputedRef<ComparisonSetSummary | null>;
  reset: () => void;
  replaceBackingData: (data: TempComparisonMetadata, storyMetadataList: StoryMetadataWithRenderStatus[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectNode: (type: keyof StoriesDiffResult, id: string) => void;
  selectPrevStory: (cb: (data: ComparisonResultTreeLeaf) => Promise<void>) => Promise<void>;
  selectNextStory: (cb: (data: ComparisonResultTreeLeaf) => Promise<void>) => Promise<void>;
  getDataById: (id: string) => ComparisonResultTreeLeaf | null;
}

export function useComparisonResultExplorer(): UseComparisonResultExplorerReturn {
  const _backingData = ref<null | TempComparisonMetadata>(null);
  const _storyMetadataMap = new Map<string, StoryMetadataWithRenderStatus>();

  const searchText = ref("");
  const expandedKeys = ref(new Set<string>());
  const highlightKey = ref<null | string>(null);
  const selectedType = ref<keyof StoriesDiffResult>("diff");
  const selectedStory = ref<ComparisonResultTreeLeaf | null>(null) as Ref<ComparisonResultTreeLeaf | null>;

  const _filteredData = computed<ComparisonResultTreeLeaf[]>(() => {
    if (!_backingData.value) return [];

    const localResult = _backingData.value.result;
    const lowerCaseSearchText = searchText.value.toLowerCase();
    const dataOfType = localResult[selectedType.value].map(id => {
      const data = _storyMetadataMap.get(id);
      if (!data) return null;
      return data.title.toLowerCase().includes(lowerCaseSearchText) ||
        data.name.toLowerCase().includes(lowerCaseSearchText)
        ? { ...data, type: selectedType.value }
        : null;
    });
    return filterNonNull(dataOfType);
  });

  const treeData = computed<NodeData[] | null>(() => {
    return getCompareResultTreeData(generateResultTreeFromList(_filteredData.value));
  });

  const typeOptions = computed<TypeOptions>(() => {
    if (_backingData.value === null) {
      return {
        same: null,
        diff: null,
        added: null,
        removed: null,
        skip: null,
      };
    }
    return {
      same: _backingData.value.result.same.length,
      diff: _backingData.value.result.diff.length,
      added: _backingData.value.result.added.length,
      removed: _backingData.value.result.removed.length,
      skip: _backingData.value.result.skip.length,
    };
  });

  const expandAll = () => {
    if (!treeData.value) return;
    const allKeys = treeData.value.map(node => getAllNonLeafKeys(node)).flat();
    for (const key of allKeys) {
      expandedKeys.value.add(key);
    }
  };

  const collapseAll = () => {
    expandedKeys.value.clear();
  };

  const isNullResult = computed(() => _backingData.value === null);

  const comparisonSetSummary = computed<ComparisonSetSummary | null>(() => {
    return _backingData.value === null
      ? null
      : {
          project: _backingData.value.project,
          refBranch: _backingData.value.refBranch,
          refSetId: _backingData.value.refSetId,
          refSetName: _backingData.value.refSetName,
          testBranch: _backingData.value.testBranch,
          testSetId: _backingData.value.testSetId,
          testSetName: _backingData.value.testSetName,
          resultSummary: {
            diff: _backingData.value.result.diff.length,
            added: _backingData.value.result.added.length,
            removed: _backingData.value.result.removed.length,
            same: _backingData.value.result.same.length,
            skip: _backingData.value.result.skip.length,
          },
        };
  });

  const replaceBackingData = (data: TempComparisonMetadata, storyMetadataList: StoryMetadataWithRenderStatus[]) => {
    _storyMetadataMap.clear();
    storyMetadataList.forEach(x => {
      _storyMetadataMap.set(x.id, x);
    });
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = data;
  };

  const reset = () => {
    _storyMetadataMap.clear();
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = null;
  };

  const _storyInFilteredData = (id: string): boolean => {
    return _filteredData.value.some(x => x.id === id);
  };

  const _getFirstStory = (): ComparisonResultTreeLeaf | null => {
    if (_filteredData.value.length === 0) return null;
    return _filteredData.value[0];
  };

  const _getPrevStory = (curStoryId: string): ComparisonResultTreeLeaf | null => {
    const curIndex = _filteredData.value.findIndex(x => x.id === curStoryId);
    if (curIndex === -1) return null;
    const prevIndex = curIndex - 1;
    if (prevIndex < 0) return null;
    return _filteredData.value[prevIndex];
  };

  const _getNextStory = (curStoryId: string): ComparisonResultTreeLeaf | null => {
    const curIndex = _filteredData.value.findIndex(x => x.id === curStoryId);
    if (curIndex === -1) return null;
    const nextIndex = curIndex + 1;
    if (nextIndex >= _filteredData.value.length) return null;
    return _filteredData.value[nextIndex];
  };

  const getDataById = (id: string): ComparisonResultTreeLeaf | null => {
    const data = _storyMetadataMap.get(id);
    if (!data) return null;
    if (!_backingData.value) return null;

    let type: keyof StoriesDiffResult | null = null;
    for (const x in _backingData.value.result) {
      const typedType = x as keyof typeof _backingData.value.result;
      if (_backingData.value.result[typedType].includes(id)) {
        type = typedType;
        break;
      }
    }
    if (type === null) return null;
    return { type, ...data };
  };

  const selectNode = (type: keyof StoriesDiffResult, id: string) => {
    const data = getDataById(id);
    if (data) {
      const tree = getCompareResultTreeData(generateResultTreeFromList([{ ...data }]));
      const leaf = checkSingleBranchAndGetLeaf(tree[0]);
      if (leaf.isSingleBranch) {
        selectedType.value = type;
        highlightKey.value = leaf.leafKey;
        const allNonLeafKeys = getAllNonLeafKeys(tree[0]);
        for (const key of allNonLeafKeys) {
          expandedKeys.value.add(key);
        }
        selectedStory.value = data;
      }
    }
  };

  const _selectFirstStory = async (cb: (data: ComparisonResultTreeLeaf) => Promise<void>) => {
    const first = _getFirstStory();
    if (first) {
      const id = first.id;
      selectNode(selectedType.value, id);
      await cb(first);
    }
  };

  const selectPrevStory = async (cb: (data: ComparisonResultTreeLeaf) => Promise<void>) => {
    if (selectedStory.value && _storyInFilteredData(selectedStory.value.id)) {
      const prev = _getPrevStory(selectedStory.value.id);
      if (prev) {
        const id = prev.id;
        selectNode(selectedType.value, id);
        await cb(prev);
      }
    } else {
      await _selectFirstStory(cb);
    }
  };

  const selectNextStory = async (cb: (data: ComparisonResultTreeLeaf) => Promise<void>) => {
    if (selectedStory.value && _storyInFilteredData(selectedStory.value.id)) {
      const next = _getNextStory(selectedStory.value.id);
      if (next) {
        const id = next.id;
        selectNode(selectedType.value, id);
        await cb(next);
      }
    } else {
      await _selectFirstStory(cb);
    }
  };

  return {
    treeData,
    searchText,
    typeOptions,
    selectedType,
    highlightKey,
    selectedStory,
    expandedKeys,
    isNullResult,
    comparisonSetSummary,
    replaceBackingData,
    reset,
    expandAll,
    collapseAll,
    selectNode,
    selectPrevStory,
    selectNextStory,
    getDataById,
  };
}
