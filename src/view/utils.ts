import type { TreeNode } from "primevue/treenode";
import type { StoryMetadata } from "src/service/crawler/type";

export type StoryTree = {
  [key: string]: StoryMetadata | StoryTree;
};

export function treeOfStoryMetadata(metadataArr: StoryMetadata[]): StoryTree {
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

function isLeftNode(node: StoryTree): boolean {
  const keys = Object.keys(node);
  const leftKeys = ["id", "componentId", "title", "kind", "tags", "name", "story"];
  return keys.every(key => leftKeys.includes(key));
}

export function treeNodesForPrimevue(storyTree: StoryTree, parentKey = ""): TreeNode[] {
  const result: TreeNode[] = [];

  const entries = Object.entries(storyTree);
  for (const [key, value] of entries) {
    const node: TreeNode = {
      key: parentKey ? `${parentKey}-${key}` : key,
      label: key,
    };

    if (!isLeftNode(value as StoryTree)) {
      node.children = treeNodesForPrimevue(value as StoryTree, node.key);
    }

    result.push(node);
  }

  return result;
}
