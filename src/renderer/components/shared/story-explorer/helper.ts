import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { BaseStoryMetadata } from "../../../composables/useStoryExplorer";
import type { NodeData } from "../../general/tree/type";
import type { StoryMetadata, StoryMetadataWithRenderStatus, StoryState } from "../../../../shared/type";

interface StoryData {
  title: string;
  name: string;
}

export interface StoryMetadataInScreenshotPageExplorer extends StoryMetadata {
  state: StoryState;
  browserName: string | null;
  startTime: string | null;
  endTime: string | null;
  storyErr: boolean | null;
}

export type TreeObj<T extends object> = {
  [key: string]: T | TreeObj<T>;
};

export type ScreenshotPageStoryTree = TreeObj<StoryMetadataInScreenshotPageExplorer>;

export type SavedSetPageStoryTree = TreeObj<StoryMetadataWithRenderStatus>;

export function generateTreeFromList<T extends StoryData>(list: T[]): TreeObj<T> {
  const result: TreeObj<T> = {};

  for (const data of list) {
    const layers = data.title.split("/").filter(x => x !== "");
    let currentLayer: TreeObj<T> = result;

    for (const layer of layers) {
      if (!currentLayer[layer]) {
        currentLayer[layer] = {};
      }
      currentLayer = currentLayer[layer] as TreeObj<T>;
    }

    currentLayer[data.name] = data;
  }

  return result;
}

function isLeafNode<T extends BaseStoryMetadata>(node: T | TreeObj<T>): node is T {
  const keys = Object.keys(node);
  const requiredLeafKeys: (keyof StoryMetadataInScreenshotPageExplorer & keyof StoryMetadataWithRenderStatus)[] = [
    "id",
    "title",
    "tags",
    "name",
  ];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getScreenshotPageTreeData(treeObj: TreeObj<BaseStoryMetadata>): NodeData[] {
  return treeNodesForUi(treeObj, isLeafNode);
}
