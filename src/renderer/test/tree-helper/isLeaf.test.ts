import { describe, expect, it } from "vitest";
import { isLeaf } from "../../components/general/tree/tree-helper";
import type { NodeData } from "../../components/general/tree/type";

describe("isLeaf", () => {
  // Node with undefined children is considered a leaf
  it("should return true when children are undefined", () => {
    const node = { key: "node1", label: "Node 1" };
    expect(isLeaf(node)).toBe(true);
  });

  // Node with an empty children array is considered a leaf
  it("should return true when children array is empty", () => {
    const node: NodeData = { key: "node1", label: "Node 1", children: [] };
    expect(isLeaf(node)).toBe(true);
  });

  // Node with non-empty children array is not considered a leaf
  it("should return false when children array is not empty", () => {
    const node = { key: "node1", label: "Node 1", children: [{ key: "node2", label: "Node 2" }] };
    expect(isLeaf(node)).toBe(false);
  });
});
