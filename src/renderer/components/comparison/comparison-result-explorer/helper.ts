import { treeNodesForUi } from "../../general/tree/tree-helper";
import { generateTreeFromList } from "../../shared/story-explorer/helper";
import type { TreeObj } from "../../shared/story-explorer/helper";
import type { StoriesDiffResult, StoryMetadataWithRenderStatus } from "../../../../shared/type";

export interface ComparisonResultTreeLeaf extends StoryMetadataWithRenderStatus {
  type: keyof StoriesDiffResult;
}

export type CompareResultTree = TreeObj<ComparisonResultTreeLeaf>;

export function generateTreeFromRespData(data: ComparisonResultTreeLeaf[]): CompareResultTree {
  return generateTreeFromList(data);
}

function isCompareResultLeaf(node: CompareResultTree | ComparisonResultTreeLeaf): node is ComparisonResultTreeLeaf {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name", "type"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getCompareResultTreeData(treeObj: CompareResultTree) {
  return treeNodesForUi(treeObj, isCompareResultLeaf);
}
