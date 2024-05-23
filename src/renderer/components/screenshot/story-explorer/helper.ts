import { treeNodesForUi } from "../../general/tree/tree-helper";
import type { TreeObj } from "../../../utils/story-tree-utils";
import type { StoryMetadata, StoryState } from "../../../../shared/type";

export interface StoryMetadataInExplorer extends StoryMetadata {
  state: StoryState;
  browserName: string | null;
  startTime: string | null;
  endTime: string | null;
  storyErr: boolean | null;
}

export type StoryTree = TreeObj<StoryMetadataInExplorer>;

function isLeafNode(node: StoryTree | StoryMetadataInExplorer): node is StoryMetadataInExplorer {
  const keys = Object.keys(node);
  const requiredLeafKeys = ["id", "title", "tags", "name"];
  return requiredLeafKeys.every(key => keys.includes(key));
}

export function getScreenshotPageTreeData(treeObj: StoryTree) {
  return treeNodesForUi(treeObj, isLeafNode);
}
