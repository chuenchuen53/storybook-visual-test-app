import { describe, expect, it } from "vitest";
import { getScreenshotPageTreeData } from "@renderer/components/screenshot/story-explorer/helper";
import type { StoryTree } from "@renderer/components/screenshot/story-explorer/helper";

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
        title: "Title 1",
        tags: ["tag1"],
        name: "Name 1",
      },
      node2: {
        id: "2",
        title: "Title 2",
        tags: ["tag2"],
        name: "Name 2",
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
            title: "Test Title",
            tags: ["tag1", "tag2"],
            name: "Test Name",
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
        Button: {
          Main: {
            id: "general-button--main",
            title: "general/Button",
            name: "Main",
            tags: ["a"],
          },
          Disabled: {
            id: "general-button--disabled",
            title: "general/Button",
            name: "Disabled",
            tags: ["a"],
          },
        },
        IconButton: {
          "Icon Button": {
            id: "general-iconbutton--icon-button",
            title: "general/IconButton",
            name: "Icon Button",
            tags: ["a"],
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
            key: "general-Button",
            label: "Button",
            children: [
              {
                key: "general-Button-Main",
                label: "Main",
                data: storyTree.general.Button.Main,
              },
              {
                key: "general-Button-Disabled",
                label: "Disabled",
                data: storyTree.general.Button.Disabled,
              },
            ],
          },
          {
            key: "general-IconButton",
            label: "IconButton",
            children: [
              {
                key: "general-IconButton-Icon Button",
                label: "Icon Button",
                data: storyTree.general.IconButton["Icon Button"],
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
