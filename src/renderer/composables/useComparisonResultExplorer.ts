import { computed, ref } from "vue";
import {
  generateTreeFromRespData,
  getCompareResultTreeData,
} from "../components/comparison/comparison-result-explorer/helper";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import { filterNonNull } from "../utils/utils";
import type { ComparisonResponse$Data, StoriesDiffResult, StoryScreenshotMetadata } from "../../shared/type";
import type { ComputedRef, Ref } from "vue";
import type { NodeData } from "../components/general/tree/type";

interface ComparisonSetMetadata {
  project: string;
  refBranch: string;
  refSetId: string;
  testBranch: string;
  testSetId: string;
}

export type TypeOptions = Record<keyof StoriesDiffResult, number | null>;

export interface UseComparisonResultExplorerReturn {
  treeData: ComputedRef<NodeData[] | null>;
  searchText: Ref<string>;
  typeOptions: ComputedRef<TypeOptions>;
  selectedType: Ref<keyof StoriesDiffResult>;
  highlightKey: Ref<string | null>;
  isNullResult: () => boolean;
  expandedKeys: Ref<Set<string>>;
  replaceBackingData: (data: ComparisonResponse$Data, storyMetadataList: StoryScreenshotMetadata[]) => void;
  getSetMetadata: () => null | ComparisonSetMetadata;
  expandAll: () => void;
  collapseAll: () => void;
}

export function useComparisonResultExplorer(): UseComparisonResultExplorerReturn {
  const _backingData = ref<null | ComparisonResponse$Data>(null);
  const _storyMetadataMap = new Map<string, StoryScreenshotMetadata>();

  const searchText = ref("");
  const expandedKeys = ref(new Set<string>());
  const highlightKey = ref<null | string>(null);
  const selectedType = ref<keyof StoriesDiffResult>("diff");

  const treeData = computed<NodeData[] | null>(() => {
    if (!_backingData.value) return null;

    const localResult = _backingData.value.result;
    if (!localResult) return null;

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

    return getCompareResultTreeData(generateTreeFromRespData(nunNullDataOfType));
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

  const isNullResult = () => _backingData.value === null;

  const replaceBackingData = (data: ComparisonResponse$Data, storyMetadataList: StoryScreenshotMetadata[]) => {
    _storyMetadataMap.clear();
    storyMetadataList.forEach(x => {
      _storyMetadataMap.set(x.id, x);
    });
    highlightKey.value = null;
    expandedKeys.value.clear();
    _backingData.value = data;
  };

  const getSetMetadata = (): null | ComparisonSetMetadata => {
    return _backingData.value === null
      ? null
      : {
          project: _backingData.value.project,
          refBranch: _backingData.value.refBranch,
          refSetId: _backingData.value.refSetId,
          testBranch: _backingData.value.testBranch,
          testSetId: _backingData.value.testSetId,
        };
  };

  return {
    treeData,
    searchText,
    typeOptions,
    selectedType,
    highlightKey,
    expandedKeys,
    isNullResult,
    replaceBackingData,
    getSetMetadata,
    expandAll,
    collapseAll,
  };
}
