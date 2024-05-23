import type { NodeData } from "./components/general/tree/type";
import type { TreeNode } from "primevue/treenode";
import type { CompareResponse, StoryMetadata, StoryState } from "../shared/type";

export interface StoryMetadataInExplorer extends StoryMetadata {
  state: StoryState;
  browserName: string | null;
  startTime: string | null;
  endTime: string | null;
  storyErr: boolean | null;
}

export type StoryTree = {
  [key: string]: StoryMetadataInExplorer | StoryTree;
};

export type CompareResultTreeLeaf = {
  storyId: string;
  resultType: "same" | "added" | "removed" | "diff";
};

export type CompareResultTree = {
  [key: string]: CompareResultTreeLeaf | CompareResultTree;
};

export function treeOfStoryMetadata(metadataArr: StoryMetadataInExplorer[]): StoryTree {
  const result: StoryTree = {};

  for (const metadata of metadataArr) {
    const [multiLayer, name] = metadata.id.split("--");
    const layers = multiLayer.split("-");
    let currentLayer = result;

    for (const layer of layers) {
      if (!currentLayer[layer]) {
        currentLayer[layer] = {};
      }
      currentLayer = currentLayer[layer] as StoryTree;
    }

    currentLayer[name] = metadata;
  }

  return result;
}

export function treeOfCompareResult(compareResult: CompareResponse): CompareResultTree {
  const obj: {
    same: CompareResultTreeLeaf[];
    added: CompareResultTreeLeaf[];
    removed: CompareResultTreeLeaf[];
    diff: CompareResultTreeLeaf[];
  } = {
    same: compareResult.result.same.map(storyId => ({ storyId, resultType: "same" })),
    added: compareResult.result.added.map(storyId => ({ storyId, resultType: "added" })),
    removed: compareResult.result.removed.map(storyId => ({ storyId, resultType: "removed" })),
    diff: compareResult.result.diff.map(storyId => ({ storyId, resultType: "diff" })),
  };
  console.log(obj);

  const computeTreeNode = (leafs: CompareResultTreeLeaf[]): CompareResultTree => {
    const root: CompareResultTree = {};

    for (const leaf of leafs) {
      let currentLayer = root;
      const [multiLayer, name] = leaf.storyId.includes("--") ? leaf.storyId.split("--") : [leaf.storyId, ""];
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

export function isLeftNode(node: StoryTree): boolean {
  const keys = Object.keys(node);
  const leftKeys = ["id", "componentId", "title", "kind", "tags", "name", "story"];
  return leftKeys.every(key => keys.includes(key));
}

export function isCompareResultLeaf(node: CompareResultTree): boolean {
  const keys = Object.keys(node);
  const leftKeys = ["storyId"];
  return leftKeys.every(key => keys.includes(key));
}

export function treeNodesForUi<T>(storyTree: T, isLeftNodePredicate: (x: T) => boolean, parentKey = ""): NodeData[] {
  const result: NodeData[] = [];

  const entries = Object.entries(storyTree);
  for (const [key, value] of entries) {
    const node: NodeData = {
      key: parentKey ? `${parentKey}-${key}` : key,
      label: key,
    };

    if (isLeftNodePredicate(value as T)) {
      node.data = value;
    } else {
      node.children = treeNodesForUi(value as T, isLeftNodePredicate, node.key);
    }

    result.push(node);
  }

  return result;
}
