import { describe, expect, it } from "vitest";
import { checkSingleBranchAndGetLeaf } from "@renderer/components/general/tree/tree-helper";

describe("checkSingleBranchAndGetLeaf", () => {
  // Node is a leaf and is the only node
  it("should return true for isSingleBranch and the correct leafKey when the node is a leaf and has no children", () => {
    const leafNode = { key: "leaf1", label: "Leaf Node" };
    const result = checkSingleBranchAndGetLeaf(leafNode);
    expect(result.isSingleBranch).toBe(true);
    expect(result.leafKey).toBe("leaf1");
    expect(result.nonLeafKeys).toEqual([]);
  });

  // Node has exactly one child which is a leaf
  it("should return true for isSingleBranch and the correct leafKey when the node has exactly one child which is a leaf", () => {
    const parentNode = { key: "parent", label: "Parent Node", children: [{ key: "leaf1", label: "Leaf Node" }] };
    const result = checkSingleBranchAndGetLeaf(parentNode);
    expect(result.isSingleBranch).toBe(true);
    expect(result.leafKey).toBe("leaf1");
    expect(result.nonLeafKeys).toEqual(["parent"]);
  });

  // All nodes in a single branch path are correctly identified as non-leaf except the last one
  it("should correctly identify non-leaf nodes in a single branch path", () => {
    const rootNode = {
      key: "root",
      label: "Root Node",
      children: [
        {
          key: "child1",
          label: "Child Node 1",
          children: [
            {
              key: "child2",
              label: "Child Node 2",
              children: [
                {
                  key: "leaf1",
                  label: "Leaf Node 1",
                },
              ],
            },
          ],
        },
      ],
    };
    const result = checkSingleBranchAndGetLeaf(rootNode);
    expect(result.isSingleBranch).toBe(true);
    expect(result.leafKey).toBe("leaf1");
    expect(result.nonLeafKeys).toEqual(["root", "child1", "child2"]);
  });

  // Node has multiple children
  it("should return false for isSingleBranch and no specific leafKey when the node has multiple children", () => {
    const parentNode = {
      key: "parent",
      label: "Parent Node",
      children: [
        { key: "child1", label: "Child 1" },
        { key: "child2", label: "Child 2" },
      ],
    };
    const result = checkSingleBranchAndGetLeaf(parentNode);
    expect(result.isSingleBranch).toBe(false);
    expect(result.leafKey).toBe(null);
    expect(result.nonLeafKeys).toEqual(null);
  });

  // Node has a complex subtree that is not a single branch
  it("should return false for isSingleBranch and null leafKey when the node has a complex subtree", () => {
    const rootNode = {
      key: "root",
      label: "Root Node",
      children: [
        { key: "child1", label: "Child 1", children: [{ key: "grandchild1", label: "Grandchild 1" }] },
        { key: "child2", label: "Child 2" },
      ],
    };
    const result = checkSingleBranchAndGetLeaf(rootNode);
    expect(result.isSingleBranch).toBe(false);
    expect(result.leafKey).toBe(null);
    expect(result.nonLeafKeys).toBe(null);
  });

  // Node with a single child that itself has multiple children
  it("should return true for isSingleBranch and the correct leafKey when the node has a single child that itself has multiple children", () => {
    const parentNode = {
      key: "parent",
      label: "Parent Node",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [
            { key: "grandchild1", label: "Grandchild 1" },
            { key: "grandchild2", label: "Grandchild 2" },
          ],
        },
      ],
    };
    const result = checkSingleBranchAndGetLeaf(parentNode);
    expect(result.isSingleBranch).toBe(true);
    expect(result.leafKey).toBe("grandchild1");
    expect(result.nonLeafKeys).toEqual(["parent", "child1"]);
  });
});
