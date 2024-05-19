import type { TreeNode } from "primevue/treenode";
import type { StoryMetadata, StoryState } from "src/service/crawler/type";

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

function isLeftNode(node: StoryTree): boolean {
  const keys = Object.keys(node);
  const leftKeys = ["id", "componentId", "title", "kind", "tags", "name", "story"];
  return leftKeys.every(key => keys.includes(key));
}

export function treeNodesForPrimevue(storyTree: StoryTree, parentKey = ""): TreeNode[] {
  const result: TreeNode[] = [];

  const entries = Object.entries(storyTree);
  for (const [key, value] of entries) {
    const node: TreeNode = {
      key: parentKey ? `${parentKey}-${key}` : key,
      label: key,
      styleClass: "fking",
    };

    if (isLeftNode(value as StoryTree)) {
      node.data = value;
    } else {
      node.children = treeNodesForPrimevue(value as StoryTree, node.key);
    }

    result.push(node);
  }

  return result;
}
