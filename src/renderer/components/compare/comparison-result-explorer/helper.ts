import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { CompareResponse$Data, StoriesDiffResult } from "src/shared/type";
import type { TreeObj } from "src/renderer/utils/story-tree-utils";

export type CompareResultTreeLeaf = {
  storyId: string;
  resultType: keyof StoriesDiffResult;
};

export type CompareResultTree = TreeObj<CompareResultTreeLeaf>;

export function generateTreeFromRespData(data: CompareResponse$Data): CompareResultTree {
  const obj: Record<keyof StoriesDiffResult, CompareResultTreeLeaf[]> = {
    same: data.result.same.map(storyId => ({ storyId, resultType: "same" })),
    added: data.result.added.map(storyId => ({ storyId, resultType: "added" })),
    removed: data.result.removed.map(storyId => ({ storyId, resultType: "removed" })),
    diff: data.result.diff.map(storyId => ({ storyId, resultType: "diff" })),
  };

  const computeTreeNode = (leafs: CompareResultTreeLeaf[]): CompareResultTree => {
    const root: CompareResultTree = {};

    for (const leaf of leafs) {
      let currentLayer = root;
      const [multiLayer, name] = leaf.storyId.split("--");
      const layers = multiLayer.split("-");

      layers.forEach(layer => {
        if (!currentLayer[layer]) {
          currentLayer[layer] = {};
        }
        currentLayer = currentLayer[layer] as CompareResultTree;
      });

      currentLayer[name] = leaf;
    }

    return root;
  };

  return {
    same: computeTreeNode(obj.same),
    added: computeTreeNode(obj.added),
    removed: computeTreeNode(obj.removed),
    diff: computeTreeNode(obj.diff),
  };
}

function isCompareResultLeaf(node: CompareResultTree | CompareResultTreeLeaf): node is CompareResultTreeLeaf {
  const keys = Object.keys(node);
  const leafKeys = ["storyId", "resultType"];
  return leafKeys.every(key => keys.includes(key));
}

export function getCompareResultTreeData(treeObj: CompareResultTree) {
  return treeNodesForUi(treeObj, isCompareResultLeaf);
}
