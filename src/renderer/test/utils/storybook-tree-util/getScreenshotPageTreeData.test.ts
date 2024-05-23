import { describe, expect, it } from "vitest";
import { getScreenshotPageTreeData } from "../../../components/screenshot/story-explorer/helper";
import type { StoryTree } from "../../../components/screenshot/story-explorer/helper";

describe("getScreenshotPageTreeData", () => {
  it("should return an empty array when given an empty object", () => {
    const storyTree = {};
    const result = getScreenshotPageTreeData(storyTree);
    expect(result).toEqual([]);
  });

  it("should handle trees where all nodes are leaf nodes", () => {
    const storyTree = {
      node1: {
        id: "1",
        componentId: "comp1",
        title: "Title 1",
        kind: "Kind 1",
        tags: ["tag1"],
        name: "Name 1",
        story: "Story 1",
      },
      node2: {
        id: "2",
        componentId: "comp2",
        title: "Title 2",
        kind: "Kind 2",
        tags: ["tag2"],
        name: "Name 2",
        story: "Story 2",
      },
    };
    const result = getScreenshotPageTreeData(storyTree as unknown as StoryTree);
    const expectedNodes = [
      {
        key: "node1",
        label: "node1",
        data: storyTree.node1,
      },
      {
        key: "node2",
        label: "node2",
        data: storyTree.node2,
      },
    ];
    expect(result).toEqual(expectedNodes);
  });

  it("should handle deeply nested tree structures without error", () => {
    const storyTree = {
      level1: {
        level2: {
          level3: {
            id: "test-id",
            componentId: "test-component",
            title: "Test Title",
            kind: "Test Kind",
            tags: ["tag1", "tag2"],
            name: "Test Name",
            story: "Test Story",
          },
        },
      },
    };
    const result = getScreenshotPageTreeData(storyTree as unknown as StoryTree);
    expect(result).toEqual([
      {
        key: "level1",
        label: "level1",
        children: [
          {
            key: "level1-level2",
            label: "level2",
            children: [
              {
                key: "level1-level2-level3",
                label: "level3",
                data: storyTree.level1.level2.level3,
              },
            ],
          },
        ],
      },
    ]);
  });

  it("should return an array of tree nodes when given a tree", () => {
    const storyTree = {
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

    const expectedNodes = [
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
                data: storyTree.general.button.main,
              },
              {
                key: "general-button-disabled",
                label: "disabled",
                data: storyTree.general.button.disabled,
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
                data: storyTree.general.iconbutton["icon-button"],
              },
            ],
          },
        ],
      },
    ];

    const result = getScreenshotPageTreeData(storyTree as unknown as StoryTree);
    expect(result).toEqual(expectedNodes);
  });
});
