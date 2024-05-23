import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TreeNode from "../../components/general/tree/TreeNode.vue";
import Tree from "../../components/general/tree/Tree.vue";

describe("Tree component", () => {
  it("should render TreeNode components for each node in props.data", () => {
    const testData = [
      { key: "1", label: "Node 1" },
      { key: "2", label: "Node 2" },
      { key: "3", label: "Node 3" },
    ];
    const wrapper = shallowMount(Tree, {
      props: { data: testData },
    });
    const treeNodes = wrapper.findAllComponents(TreeNode);
    expect(treeNodes.length).toBe(testData.length);
    testData.forEach((node, index) => {
      expect(treeNodes.at(index).props("node")).toEqual(node);
    });
  });
});
