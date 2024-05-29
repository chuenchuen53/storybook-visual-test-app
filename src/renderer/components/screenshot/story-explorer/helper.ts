import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { StoryMetadata, StoryScreenshotMetadata, StoryState } from "../../../../shared/type";
import type { TreeObj } from "../../../utils/story-tree-utils";

export interface StoryMetadataInExplorer extends StoryMetadata {
  state: StoryState;
  browserName: string | null;
  startTime: string | null;
  endTime: string | null;
  storyErr: boolean | null;
}

export type StoryTree = TreeObj<StoryMetadataInExplorer>;

export type SavedStoryTree = TreeObj<StoryScreenshotMetadata>;

function isLeafNode(node: StoryTree | StoryMetadataInExplorer): node is StoryMetadataInExplorer {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getScreenshotPageTreeData(treeObj: StoryTree) {
  return treeNodesForUi(treeObj, isLeafNode);
}

function isSavedSetLeafNode(node: SavedStoryTree | StoryScreenshotMetadata): node is StoryScreenshotMetadata {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getSavedSetPageTreeData(treeObj: SavedStoryTree) {
  return treeNodesForUi(treeObj, isSavedSetLeafNode);
}
