import type { NodeData } from "./type";

export function isLeaf(x: NodeData): boolean {
  return x.children === undefined ? true : x.children.length === 0;
}

export function getAllNonLeafKeys(x: NodeData): string[] {
  if (isLeaf(x)) {
    return [];
  }
  return [x.key, ...x.children.flatMap(child => getAllNonLeafKeys(child))];
}

export function isSingleBranch(x: NodeData): boolean {
  if (isLeaf(x)) {
    return true;
  }

  if (x.children.length !== 1) {
    return false;
  }

  return isSingleBranch(x.children[0]);
}

export function getLeafKeyFromSingleBranch(x: NodeData): string {
  if (isLeaf(x)) {
    return x.key;
  }

  return getLeafKeyFromSingleBranch(x.children[0]);
}
