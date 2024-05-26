import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { CompareResponse$Data, StoriesDiffResult } from "src/shared/type";
import type { TreeObj } from "src/renderer/utils/story-tree-utils";

export type CompareResultType = keyof StoriesDiffResult;

export type CompareResultTreeLeaf = {
  storyId: string;
  resultType: CompareResultType;
};

export type CompareResultTree = TreeObj<CompareResultTreeLeaf>;

export function generateTreeFromRespData(data: CompareResponse$Data, resultType: CompareResultType): CompareResultTree {
  const leafs: CompareResultTreeLeaf[] = data.result[resultType].map(storyId => ({ storyId, resultType }));

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
}

function isCompareResultLeaf(node: CompareResultTree | CompareResultTreeLeaf): node is CompareResultTreeLeaf {
  const keys = Object.keys(node);
  const leafKeys = ["storyId", "resultType"];
  return leafKeys.every(key => keys.includes(key));
}

export function getCompareResultTreeData(treeObj: CompareResultTree) {
  return treeNodesForUi(treeObj, isCompareResultLeaf);
}
