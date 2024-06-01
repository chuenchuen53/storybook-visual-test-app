import { describe, expect, it } from "vitest";
import { getAllNonLeafKeys } from "@renderer/components/general/tree/tree-helper";
import type { NodeData } from "@renderer/components/general/tree/type";

describe("getAllNonLeafKeys", () => {
  // Return all non-leaf keys from a complex node structure
  it("should return all non-leaf keys from a complex node structure", () => {
    const complexNode = {
      key: "root",
      label: "Root",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [{ key: "leaf1", label: "Leaf 1" }],
        },
        {
          key: "child2",
          label: "Child 2",
        },
      ],
    };
    const result = getAllNonLeafKeys(complexNode);
    expect(result).toEqual(["root", "child1"]);
  });

  // Return an empty array for a leaf node
  it("should return an empty array for a leaf node", () => {
    const leafNode = {
      key: "leaf",
      label: "Leaf",
    };
    const result = getAllNonLeafKeys(leafNode);
    expect(result).toEqual([]);
  });

  // Include the root key if it has children
  it("should include root key when it has children", () => {
    const nodeWithChildren = {
      key: "root",
      label: "Root",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [{ key: "leaf1", label: "Leaf 1" }],
        },
        {
          key: "child2",
          label: "Child 2",
        },
      ],
    };
    const result = getAllNonLeafKeys(nodeWithChildren);
    expect(result).toEqual(["root", "child1"]);
  });

  // Recursively include keys of all non-leaf child nodes
  it("should recursively include keys of all non-leaf child nodes", () => {
    const complexNode = {
      key: "root",
      label: "Root",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [{ key: "leaf1", label: "Leaf 1" }],
        },
        {
          key: "child2",
          label: "Child 2",
        },
      ],
    };
    const result = getAllNonLeafKeys(complexNode);
    expect(result).toEqual(["root", "child1"]);
  });

  // Handle nested structures with multiple levels of children
  it("should handle nested structures with multiple levels of children", () => {
    const complexNode = {
      key: "root",
      label: "Root",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [{ key: "leaf1", label: "Leaf 1" }],
        },
        {
          key: "child2",
          label: "Child 2",
        },
      ],
    };
    const result = getAllNonLeafKeys(complexNode);
    expect(result).toEqual(["root", "child1"]);
  });

  // Ensure that nodes with undefined children property are treated as leaf nodes
  it("should handle nodes with undefined children property as leaf nodes", () => {
    const node: NodeData = {
      key: "root",
      label: "Root",
      children: undefined,
    };
    const result = getAllNonLeafKeys(node);
    expect(result).toEqual([]);
  });

  // Handle nodes with an empty children array as leaf nodes
  it("should handle nodes with an empty children array as leaf nodes", () => {
    const node: NodeData = {
      key: "root",
      label: "Root",
      children: [],
    };
    const result = getAllNonLeafKeys(node);
    expect(result).toEqual([]);
  });

  // Return an empty array when the root node itself is a leaf
  it("should return an empty array when the root node itself is a leaf", () => {
    const leafNode = {
      key: "leaf",
      label: "Leaf",
    };
    const result = getAllNonLeafKeys(leafNode);
    expect(result).toEqual([]);
  });

  // Correctly process nodes with mixed leaf and non-leaf children
  it("should correctly process nodes with mixed leaf and non-leaf children", () => {
    const mixedNode = {
      key: "root",
      label: "Root",
      children: [
        {
          key: "child1",
          label: "Child 1",
          children: [{ key: "leaf1", label: "Leaf 1" }],
        },
        {
          key: "child2",
          label: "Child 2",
        },
      ],
    };
    const result = getAllNonLeafKeys(mixedNode);
    expect(result).toEqual(["root", "child1"]);
  });
});
