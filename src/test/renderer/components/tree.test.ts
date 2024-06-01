import type { DOMWrapper } from "@vue/test-utils";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ref } from "vue";
import TreeNode from "@renderer/components/general/tree/TreeNode.vue";
import Tree from "@renderer/components/general/tree/Tree.vue";
import { getAllNonLeafKeys } from "@renderer/components/general/tree/tree-helper";

const tree1 = [
  { key: "1", label: "Node 1", data: { id: "1" } },
  { key: "2", label: "Node 2", data: { id: "2" } },
  { key: "3", label: "Node 3", data: { id: "3" } },
];

const tree2 = [
  {
    key: "1",
    label: "Node 1",
    children: [
      { key: "1-1", label: "Node 1-1", data: { id: "1-1" } },
      { key: "1-2", label: "Node 1-2", data: { id: "1-2" } },
      {
        key: "1-3",
        label: "Node 1-3",
        children: [{ key: "1-3-1", label: "Node 1-3-1", data: { id: "1-3-1" } }],
      },
    ],
  },
  {
    key: "2",
    label: "Node 2",
    data: { id: "2" },
  },
];

const allNonLeafNodesForTree2 = tree2.map(x => getAllNonLeafKeys(x)).flat();
const numOfNodesInTree2 = 6;

describe("Tree component", () => {
  it("should not render any TreeNode components when props.data is empty", () => {
    const wrapper = mount(Tree, {
      props: { data: [] },
    });
    const treeNodes = wrapper.findAllComponents(TreeNode);
    expect(treeNodes.length).toBe(0);
    expect(wrapper.html()).toBe('<ul class="flex flex-col"></ul>');
  });

  it("should render TreeNode components for each node in props.data", () => {
    const wrapper = mount(Tree, {
      props: { data: tree1 },
    });
    const treeNodes = wrapper.findAllComponents(TreeNode);
    expect(treeNodes.length).toBe(tree1.length);
    tree1.forEach((node, index) => {
      expect(treeNodes.at(index).props("node")).toEqual(node);
    });
  });

  it("should only render 1st layer when mounted", () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
    });
    const treeNodes = wrapper.findAllComponents(TreeNode);
    expect(treeNodes.length).toBe(2);
    expect(treeNodes.at(0).props("node")).toEqual(tree2[0]);
    expect(treeNodes.at(1).props("node")).toEqual(tree2[1]);
  });

  it("should render TreeNode components recursively for nested nodes", async () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
    });

    function includeAllInOrder(textArr: string[]) {
      const domText = wrapper.text();
      const textIndices = textArr.map(text => domText.indexOf(text));
      return textIndices.every((index, i) => index !== -1 && (i === 0 || index > textIndices[i - 1]));
    }

    async function addExpandedKeys(key: string) {
      wrapper.vm.expandedKeys.add(key);
      await wrapper.vm.$nextTick();
    }

    async function removeExpandedKeys(key: string) {
      wrapper.vm.expandedKeys.delete(key);
      await wrapper.vm.$nextTick();
    }

    expect(wrapper.findAllComponents(TreeNode).length).toBe(2);
    expect(includeAllInOrder(["Node 1", "Node 2"])).toBeTruthy();

    await addExpandedKeys("1");
    expect(wrapper.findAllComponents(TreeNode).length).toBe(5);
    expect(includeAllInOrder(["Node 1", "Node 1-1", "Node 1-2", "Node 1-3", "Node 2"])).toBeTruthy();

    await addExpandedKeys("1-3");
    expect(wrapper.findAllComponents(TreeNode).length).toBe(6);
    expect(includeAllInOrder(["Node 1", "Node 1-1", "Node 1-2", "Node 1-3", "Node 1-3-1", "Node 2"])).toBeTruthy();

    await removeExpandedKeys("1");
    expect(wrapper.findAllComponents(TreeNode).length).toBe(2);
    expect(includeAllInOrder(["Node 1", "Node 2"])).toBeTruthy();
  });

  it("should have highlighted style in TreeNode when highlighted for different layers", async () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
    });

    allNonLeafNodesForTree2.forEach(x => wrapper.vm.expandedKeys.add(x));
    await wrapper.vm.$nextTick();

    function onlyHighlight(text: string) {
      const allDom = wrapper.findAll(".tree-node-wrapper");
      const [assertNode, other] = allDom.reduce<DOMWrapper<Element>[][]>(
        (acc, cur) => {
          if (cur.text() === text) {
            acc[0].push(cur);
          } else {
            acc[1].push(cur);
          }
          return acc;
        },
        [[], []],
      );
      expect(assertNode.length).toBe(1);
      expect(other.length).toBe(numOfNodesInTree2 - 1);
      expect(assertNode[0].classes()).toContain("highlighted");
      expect(other.every(x => !x.classes().includes("highlighted"))).toBeTruthy();
    }

    // Highlight 1st layer
    // @ts-ignore
    wrapper.vm.highlightKey = "1";
    await wrapper.vm.$nextTick();
    expect(onlyHighlight("Node 1"));

    // Highlight 2nd layer
    // @ts-ignore
    wrapper.vm.highlightKey = "1-3";
    await wrapper.vm.$nextTick();
    expect(onlyHighlight("Node 1-3"));

    // Highlight 3rd layer
    // @ts-ignore
    wrapper.vm.highlightKey = "1-3-1";
    await wrapper.vm.$nextTick();
    expect(onlyHighlight("Node 1-3-1"));
  });

  it("should emit nodeClick event with correct node data when a node is clicked", async () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
    });

    const treeNode = wrapper.findComponent(TreeNode);

    treeNode.vm.$emit("node-click", treeNode.props("node"));

    // Check if the nodeClick event was emitted with the correct data
    expect(wrapper.emitted("nodeClick")).toBeTruthy();
    expect(wrapper.emitted("nodeClick")[0][0]).toEqual(tree2[0]);

    allNonLeafNodesForTree2.forEach(x => wrapper.vm.expandedKeys.add(x));
    await wrapper.vm.$nextTick();

    const allTreeNodes = wrapper.findAllComponents(TreeNode);

    function getTreeNode(key: string) {
      return allTreeNodes.filter(node => node.props("node").key === key)[0];
    }

    const treeNode2 = getTreeNode("1-3");
    treeNode2.vm.$emit("node-click", treeNode2.props("node"));
    expect(wrapper.emitted("nodeClick")).toBeTruthy();
    expect(wrapper.emitted("nodeClick")[1][0]).toEqual({
      key: "1-3",
      label: "Node 1-3",
      children: [{ key: "1-3-1", label: "Node 1-3-1", data: { id: "1-3-1" } }],
    });

    const treeNode3 = getTreeNode("1-3-1");
    treeNode3.vm.$emit("node-click", treeNode3.props("node"));
    expect(wrapper.emitted("nodeClick")).toBeTruthy();
    expect(wrapper.emitted("nodeClick")[2][0]).toEqual({ key: "1-3-1", label: "Node 1-3-1", data: { id: "1-3-1" } });
  });

  it("should update highlightKey when a node is clicked", () => {
    const testData = [
      { key: "1", label: "Node 1" },
      { key: "2", label: "Node 2" },
    ];
    const wrapper = mount(Tree, {
      props: { data: testData },
    });
    wrapper.findComponent(TreeNode).vm.$emit("node-click", testData[0]);
    expect(wrapper.vm.highlightKey).toBe("1");

    wrapper.findComponent(TreeNode).vm.$emit("node-click", testData[1]);
    expect(wrapper.vm.highlightKey).toBe("2");
  });

  it("should correctly toggle expandedKeys when clicking on non-leaf and leaf node", async () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
    });
    const expandedKeys = wrapper.vm.expandedKeys;

    async function clickNode(text: string) {
      const nodes = wrapper.findAllComponents(TreeNode);
      const node = nodes.find(node => node.text().startsWith(text));
      await node.find("> div").trigger("click");
    }

    await clickNode("Node 1"); // Expand
    expect(expandedKeys).toEqual(new Set(["1"]));

    await clickNode("Node 1-1"); // Leaf node
    expect(expandedKeys).toEqual(new Set(["1"]));

    await clickNode("Node 1-2"); // Leaf node
    expect(expandedKeys).toEqual(new Set(["1"]));

    await clickNode("Node 1-3"); // Expand
    expect(expandedKeys).toEqual(new Set(["1", "1-3"]));

    await clickNode("Node 1-3-1"); // Leaf node
    expect(expandedKeys).toEqual(new Set(["1", "1-3"]));

    await clickNode("Node 2"); // Leaf node
    expect(expandedKeys).toEqual(new Set(["1", "1-3"]));

    await clickNode("Node 1-3"); // Collapse
    expect(expandedKeys).toEqual(new Set(["1"]));

    await clickNode("Node 1"); // Collapse
    expect(expandedKeys).toEqual(new Set());
  });

  it("should project node content slot for each TreeNode", async () => {
    const wrapper = mount(Tree, {
      props: { data: tree2 },
      slots: {
        "node-content": `<template #node-content="slotProps"><div class="my-class">{{ slotProps.node.label }}</div></template>`,
      },
    });
    allNonLeafNodesForTree2.forEach(x => wrapper.vm.expandedKeys.add(x));
    await wrapper.vm.$nextTick();
    const treeNodes = wrapper.findAllComponents(TreeNode);
    const allSlotContent = wrapper.findAll(".my-class");
    expect(treeNodes.length).toBe(numOfNodesInTree2);
    expect(allSlotContent.length).toBe(numOfNodesInTree2);

    for (let i = 0; i < numOfNodesInTree2; i++) {
      const wrapperDiv = treeNodes.at(i).find(".tree-node-wrapper");
      expect(wrapperDiv.html()).toContain(allSlotContent.at(i).html());
    }
  });

  it("should support control mode for highlightKey and expandedKeys using v-model", async () => {
    const highlightKey = ref<string | null>("1");
    const expandedKeys = ref(new Set<string>(["1", "2"]));

    // https://test-utils.vuejs.org/guide/advanced/v-model
    // https://vuejs.org/guide/components/v-model.html#usage-with-v-model
    const wrapper = mount(Tree, {
      props: {
        data: tree2,
        highlightKey: highlightKey.value,
        "onUpdate:highlightKey": (value: string | null) => (highlightKey.value = value),
        expandedKeys: expandedKeys.value,
        "onUpdate:expandedKeys": (value: Set<string>) => (expandedKeys.value = value),
      },
    });

    // Verify initial state based on provided values
    expect(wrapper.vm.highlightKey).toBe("1");
    expect(wrapper.vm.expandedKeys).toEqual(new Set(["1", "2"]));

    // Simulate changing highlightKey and expandedKeys externally
    highlightKey.value = "2";
    expandedKeys.value.add("3");

    await wrapper.vm.$nextTick();

    // Verify if the component reflects the updated values
    expect(wrapper.vm.highlightKey).toBe("1");
    expect(wrapper.vm.expandedKeys).toEqual(new Set(["1", "2", "3"]));
  });
});
