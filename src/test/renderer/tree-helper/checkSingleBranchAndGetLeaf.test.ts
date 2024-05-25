import { describe, expect, it } from "vitest";
import { checkSingleBranchAndGetLeaf } from "@renderer/components/general/tree/tree-helper";

describe("checkSingleBranchAndGetLeaf", () => {
  // Node is a leaf and is the only node
  it("should return true for isSingleBranch and the correct leafKey when the node is a leaf and has no children", () => {
    const leafNode = { key: "leaf1", label: "Leaf Node" };
    const result = checkSingleBranchAndGetLeaf(leafNode);
    const expectedResult = { isSingleBranch: true, leafKey: "leaf1", nonLeafKeys: [], leafNode };
    expect(result).toEqual(expectedResult);
  });

  // Node has exactly one child which is a leaf
  it("should return true for isSingleBranch and the correct leafKey when the node has exactly one child which is a leaf", () => {
    const parentNode = { key: "parent", label: "Parent Node", children: [{ key: "leaf1", label: "Leaf Node" }] };
    const result = checkSingleBranchAndGetLeaf(parentNode);
    const expectedResult = {
      isSingleBranch: true,
      leafKey: "leaf1",
      nonLeafKeys: ["parent"],
      leafNode: parentNode.children[0],
    };
    expect(result).toEqual(expectedResult);
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
    const expectedResult = {
      isSingleBranch: true,
      leafKey: "leaf1",
      nonLeafKeys: ["root", "child1", "child2"],
      leafNode: rootNode.children[0].children[0].children[0],
    };
    expect(result).toEqual(expectedResult);
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
    const expectedResult = { isSingleBranch: false, leafKey: null, nonLeafKeys: null, leafNode: null };
    expect(result).toEqual(expectedResult);
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
    const expectedResult = { isSingleBranch: false, leafKey: null, nonLeafKeys: null, leafNode: null };
    expect(result).toEqual(expectedResult);
  });

  // Single child until the last layer has multiple children in the last layer
  it("should identify false when the node have single children in intermediate layer but multiple children in the last layer", () => {
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
                {
                  key: "leaf2",
                  label: "Leaf Node 2",
                },
              ],
            },
          ],
        },
      ],
    };
    const result = checkSingleBranchAndGetLeaf(rootNode);
    const expectedResult = {
      isSingleBranch: false,
      leafKey: null,
      nonLeafKeys: null,
      leafNode: null,
    };
    expect(result).toEqual(expectedResult);
  });
});
