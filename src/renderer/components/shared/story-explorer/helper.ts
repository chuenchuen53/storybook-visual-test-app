import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { BaseStoryMetadata } from "../../../composables/useStoryExplorer";
import type { NodeData } from "../../general/tree/type";
import type { StoryMetadata, StoryMetadataWithRenderStatus, StoryState } from "../../../../shared/type";
import type { TreeObj } from "../../../utils/story-tree-utils";

export interface StoryMetadataInExplorer extends StoryMetadata {
  state: StoryState;
  browserName: string | null;
  startTime: string | null;
  endTime: string | null;
  storyErr: boolean | null;
}

export type StoryTree = TreeObj<StoryMetadataInExplorer>;

export type SavedStoryTree = TreeObj<StoryMetadataWithRenderStatus>;

function isLeafNode<T extends BaseStoryMetadata>(node: T | TreeObj<T>): node is T {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getScreenshotPageTreeData(treeObj: TreeObj<BaseStoryMetadata>): NodeData[] {
  return treeNodesForUi(treeObj, isLeafNode);
}
