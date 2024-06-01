import { describe, expect, it } from "vitest";
import type { LeafNodePredicate } from "@renderer/components/general/tree/tree-helper";
import { treeNodesForUi } from "@renderer/components/general/tree/tree-helper";

interface TreeData {
  id: string;
  name: string;
}

const isLeafNode: LeafNodePredicate<TreeData> = (x): x is TreeData => {
  const keys = Object.keys(x);
  return keys.length === 2 && keys.includes("id") && keys.includes("name");
};

describe("treeNodesForUi", () => {
  // Function correctly converts a simple flat tree object into a NodeData array
  it("should convert a flat tree object into a NodeData array correctly", () => {
    const treeObj = {
      node1: { id: "1", name: "Node 1" },
      node2: { id: "2", name: "Node 2" },
    };

    const result = treeNodesForUi(treeObj, isLeafNode);
    expect(result).toEqual([
      { key: "node1", label: "node1", data: treeObj.node1 },
      { key: "node2", label: "node2", data: treeObj.node2 },
    ]);
  });

  // Function handles nested tree structures by recursively converting them into NodeData arrays with children
  it("should handle nested tree structures correctly with corrected treeObj", () => {
    const treeObj = {
      node1: {
        child1: {
          id: "1-1",
          name: "Node 1-1",
        },
        child2: {
          id: "1-2",
          name: "Node 1-2",
        },
      },
      node2: { id: "2", name: "Node 2" },
    };
    const result = treeNodesForUi(treeObj, isLeafNode);
    expect(result).toEqual([
      {
        key: "node1",
        label: "node1",
        children: [
          { key: "node1-child1", label: "child1", data: treeObj.node1.child1 },
          { key: "node1-child2", label: "child2", data: treeObj.node1.child2 },
        ],
      },
      { key: "node2", label: "node2", data: treeObj.node2 },
    ]);
  });

  // Function should not modify the original tree object
  it("should not modify the original tree object", () => {
    const treeObj = {
      node1: { id: "1", name: "Node 1" },
      node2: { id: "2", name: "Node 2" },
    };

    const originalTreeObj = JSON.parse(JSON.stringify({ ...treeObj }));
    treeNodesForUi(treeObj, isLeafNode);

    expect(treeObj).toEqual(originalTreeObj);
  });

  // Function should return a predictable order of nodes based on the input tree object
  it("should return nodes in a predictable order when input tree object is provided", () => {
    const treeObj1 = {
      node1: { id: "1", name: "Node 1" },
      node2: { id: "2", name: "Node 2" },
    };

    const result1 = treeNodesForUi(treeObj1, isLeafNode);

    expect(result1).toEqual([
      { key: "node1", label: "node1", data: treeObj1.node1 },
      { key: "node2", label: "node2", data: treeObj1.node2 },
    ]);

    const treeObj2 = {
      node2: { id: "2", name: "Node 2" },
      node1: { id: "1", name: "Node 1" },
    };

    const result2 = treeNodesForUi(treeObj2, isLeafNode);

    expect(result2).toEqual([
      { key: "node2", label: "node2", data: treeObj2.node2 },
      { key: "node1", label: "node1", data: treeObj2.node1 },
    ]);
  });
});
