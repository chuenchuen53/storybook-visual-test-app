import { treeNodesForUi } from "../../general/tree/tree-helper";
import { generateTreeFromList } from "../story-explorer/helper";
import type { TreeObj } from "../story-explorer/helper";
import type { StoriesDiffResult, StoryMetadataWithRenderStatus } from "../../../../shared/type";

export interface ComparisonResultTreeLeaf extends StoryMetadataWithRenderStatus {
  type: keyof StoriesDiffResult;
}

export type CompareResultTree = TreeObj<ComparisonResultTreeLeaf>;

export function generateResultTreeFromList(data: ComparisonResultTreeLeaf[]): CompareResultTree {
  return generateTreeFromList(data);
}

function isLeaf(node: CompareResultTree | ComparisonResultTreeLeaf): node is ComparisonResultTreeLeaf {
  const keys = Object.keys(node);
  const requiredLeafKeys: (keyof ComparisonResultTreeLeaf)[] = ["id", "title", "tags", "name", "type"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getCompareResultTreeData(treeObj: CompareResultTree) {
  return treeNodesForUi(treeObj, isLeaf);
}
