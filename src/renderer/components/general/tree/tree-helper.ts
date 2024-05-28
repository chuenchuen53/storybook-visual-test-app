import type { TreeObj } from "../../../utils/story-tree-utils";
import type { NodeData } from "./type";

export type CheckSingleBranchAndGetLeafResult =
  | {
      isSingleBranch: true;
      leafKey: string;
      nonLeafKeys: string[];
      leafNode: NodeData;
    }
  | {
      isSingleBranch: false;
      leafKey: null;
      nonLeafKeys: null;
      leafNode: null;
    };

export type LeafNodePredicate<T extends object> = (x: T | TreeObj<T>) => x is T;

export function isLeaf(x: NodeData): boolean {
  return x.children === undefined ? true : x.children.length === 0;
}

export function getAllNonLeafKeys(x: NodeData): string[] {
  if (isLeaf(x)) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [x.key, ...x.children!.flatMap(child => getAllNonLeafKeys(child))];
}

export function checkSingleBranchAndGetLeaf(x: NodeData): CheckSingleBranchAndGetLeafResult {
  const nonLeafKeys: string[] = [];
  let leafKey: string | null = null;

  let leafNode: NodeData | null = null;

  function traverse(node: NodeData) {
    if (isLeaf(node)) {
      leafKey = node.key;
      leafNode = node;
    } else if (node.children?.length === 1) {
      nonLeafKeys.push(node.key);
      traverse(node.children[0]);
    }
  }

  if (isLeaf(x)) {
    return { isSingleBranch: true, leafKey: x.key, nonLeafKeys, leafNode: x };
  }

  traverse(x);

  if (leafNode === null || leafKey === null) {
    return { isSingleBranch: false, leafKey: null, nonLeafKeys: null, leafNode: null };
  }

  return { isSingleBranch: true, leafKey, nonLeafKeys, leafNode };
}

export function treeNodesForUi<T extends object>(
  treeObj: TreeObj<T>,
  leafNodePredicate: LeafNodePredicate<T>,
  parentKey = "",
): NodeData[] {
  const result: NodeData[] = [];

  const entries = Object.entries(treeObj);
  for (const [key, value] of entries) {
    const node: NodeData = {
      key: parentKey ? `${parentKey}-${key}` : key,
      label: key,
    };

    if (leafNodePredicate(value)) {
      node.data = value;
    } else {
      node.children = treeNodesForUi(value, leafNodePredicate, node.key);
    }

    result.push(node);
  }

  return result;
}
