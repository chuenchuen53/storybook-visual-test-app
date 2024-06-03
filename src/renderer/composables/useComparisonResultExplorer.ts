import { computed, ref } from "vue";
import {
  generateResultTreeFromList,
  getCompareResultTreeData,
} from "../components/shared/comparison-result-explorer/helper";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import { filterNonNull } from "../utils";
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
  isNullResult: ComputedRef<boolean>;
  expandedKeys: Ref<Set<string>>;
  comparisonSetSummary: ComputedRef<ComparisonSetSummary | null>;
  reset: () => void;
  replaceBackingData: (data: TempComparisonMetadata, storyMetadataList: StoryMetadataWithRenderStatus[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export function useComparisonResultExplorer(): UseComparisonResultExplorerReturn {
  const _backingData = ref<null | TempComparisonMetadata>(null);
  const _storyMetadataMap = new Map<string, StoryMetadataWithRenderStatus>();

  const searchText = ref("");
  const expandedKeys = ref(new Set<string>());
  const highlightKey = ref<null | string>(null);
  const selectedType = ref<keyof StoriesDiffResult>("diff");

  const treeData = computed<NodeData[] | null>(() => {
    if (!_backingData.value) return null;

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
    const nunNullDataOfType = filterNonNull(dataOfType);

    return getCompareResultTreeData(generateResultTreeFromList(nunNullDataOfType));
  });

  const typeOptions = computed<TypeOptions>(() => {
    if (_backingData.value === null) {
      return {
        same: null,
        diff: null,
        added: null,
        removed: null,
      };
    }
    return {
      same: _backingData.value.result.same.length,
      diff: _backingData.value.result.diff.length,
      added: _backingData.value.result.added.length,
      removed: _backingData.value.result.removed.length,
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

  return {
    treeData,
    searchText,
    typeOptions,
    selectedType,
    highlightKey,
    expandedKeys,
    isNullResult,
    comparisonSetSummary,
    replaceBackingData,
    reset,
    expandAll,
    collapseAll,
  };
}
