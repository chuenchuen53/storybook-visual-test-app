import { treeNodesForUi } from "../../general/tree/tree-helper";
import { generateTreeFromFlatData, type TreeObj } from "../../../utils/story-tree-utils";
import type { StoriesDiffResult, StoryScreenshotMetadata } from "../../../../shared/type";

export type CompareResultType = keyof StoriesDiffResult;

export interface ComparisonResultTreeLeaf extends StoryScreenshotMetadata {
  type: keyof StoriesDiffResult;
}

export type CompareResultTree = TreeObj<ComparisonResultTreeLeaf>;

export function generateTreeFromRespData(
  data: Record<keyof StoriesDiffResult, ComparisonResultTreeLeaf[]>,
  resultType: CompareResultType,
): CompareResultTree {
  const treeBranch = data[resultType];
  return generateTreeFromFlatData(treeBranch);
}

function isCompareResultLeaf(node: CompareResultTree | ComparisonResultTreeLeaf): node is ComparisonResultTreeLeaf {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name", "type"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getCompareResultTreeData(treeObj: CompareResultTree) {
  return treeNodesForUi(treeObj, isCompareResultLeaf);
}
