import { describe, expect, it } from "vitest";
import { treeNodesForPrimevue } from "src/view/utils";
import type { StoryTree } from "src/view/utils";
import type { TreeNode } from "primevue/treenode";

describe("treeOfStoryMetadata", () => {
  // Should return an empty array when given an empty object
  it("should return an empty array when given an empty object", () => {
    const storyTree = {};
    const result = treeNodesForPrimevue(storyTree);
    expect(result).toEqual([]);
  });

  it("should return an array of tree nodes when given a tree", () => {
    const storyTree: StoryTree = {
      general: {
        button: {
          main: {
            id: "general-button--main",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Main",
            story: "Main",
          },
          disabled: {
            id: "general-button--disabled",
            componentId: "general-button",
            title: "general/Button",
            kind: "general/Button",
            tags: ["dev", "test"],
            name: "Disabled",
            story: "Disabled",
          },
        },
        iconbutton: {
          "icon-button": {
            id: "general-iconbutton--icon-button",
            componentId: "general-iconbutton",
            title: "general/IconButton",
            kind: "general/IconButton",
            tags: ["dev", "test"],
            name: "Icon Button",
            story: "Icon Button",
          },
        },
      },
    };

    const expectedNodes: TreeNode[] = [
      {
        key: "general",
        label: "general",
        children: [
          {
            key: "general-button",
            label: "button",
            children: [
              {
                key: "general-button-main",
                label: "main",
              },
              {
                key: "general-button-disabled",
                label: "disabled",
              },
            ],
          },
          {
            key: "general-iconbutton",
            label: "iconbutton",
            children: [
              {
                key: "general-iconbutton-icon-button",
                label: "icon-button",
              },
            ],
          },
        ],
      },
    ];

    const result = treeNodesForPrimevue(storyTree);
    expect(result).toEqual(expectedNodes);
  });
});
