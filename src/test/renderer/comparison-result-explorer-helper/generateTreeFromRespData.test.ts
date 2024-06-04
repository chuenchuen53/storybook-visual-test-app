import { describe, expect, it } from "vitest";
import { generateResultTreeFromList } from "@renderer/components/shared/comparison-result-explorer/helper";
import type { ComparisonResultTreeLeaf } from "@renderer/components/shared/comparison-result-explorer/helper";

describe("generateResultTreeFromList", () => {
  // Function handles empty result arrays for same, added, removed, and diff without errors
  it("should handle empty result arrays without errors", () => {
    const data: ComparisonResultTreeLeaf[] = [];

    expect(generateResultTreeFromList(data)).toEqual({});
  });

  // Function processes a CompareResponse with multiple entries in each result type correctly
  it("should correctly process multiple entries in each result type", () => {
    const diffResult = {
      same: ["comp1--view1", "comp2--view2"],
      added: ["comp3--view3", "comp4--view4"],
      removed: ["comp5--view5", "comp6--view6"],
      diff: ["comp7--view7", "comp8--view8"],
    };

    const storyMetadataList = [
      {
        id: "comp1--view1",
        title: "comp1",
        name: "view1",
        testData: 123,
      },
      {
        id: "comp2--view2",
        title: "comp2",
        name: "view2",
        testData: 456,
      },
      {
        id: "comp3--view3",
        title: "comp3",
        name: "view3",
        testData: 789,
      },
      {
        id: "comp4--view4",
        title: "comp4",
        name: "view4",
        testData: 101112,
      },
      {
        id: "comp5--view5",
        title: "comp5",
        name: "view5",
        testData: 131415,
      },
      {
        id: "comp6--view6",
        title: "comp6",
        name: "view6",
        testData: 161718,
      },
      {
        id: "comp7--view7",
        title: "comp7",
        name: "view7",
        testData: 192021,
      },
      {
        id: "comp8--view8",
        title: "comp8",
        name: "view8",
        testData: 222324,
      },
    ];

    const flatData: ComparisonResultTreeLeaf[] = storyMetadataList.map(storyMetadata => {
      const { id, title, name, testData } = storyMetadata;
      const type = Object.keys(diffResult).find(key =>
        diffResult[key].includes(storyMetadata.id),
      ) as keyof typeof diffResult;
      if (!type) throw new Error("Type not found");
      return { id, title, name, testData, type, storyErr: false, tags: [] };
    });

    expect(generateResultTreeFromList(flatData)).toEqual({
      comp1: {
        view1: {
          id: "comp1--view1",
          title: "comp1",
          name: "view1",
          testData: 123,
          type: "same",
          storyErr: false,
          tags: [],
        },
      },
      comp2: {
        view2: {
          id: "comp2--view2",
          title: "comp2",
          name: "view2",
          testData: 456,
          type: "same",
          storyErr: false,
          tags: [],
        },
      },
      comp3: {
        view3: {
          id: "comp3--view3",
          title: "comp3",
          name: "view3",
          testData: 789,
          type: "added",
          storyErr: false,
          tags: [],
        },
      },
      comp4: {
        view4: {
          id: "comp4--view4",
          title: "comp4",
          name: "view4",
          testData: 101112,
          type: "added",
          storyErr: false,
          tags: [],
        },
      },
      comp5: {
        view5: {
          id: "comp5--view5",
          title: "comp5",
          name: "view5",
          testData: 131415,
          type: "removed",
          storyErr: false,
          tags: [],
        },
      },
      comp6: {
        view6: {
          id: "comp6--view6",
          title: "comp6",
          name: "view6",
          testData: 161718,
          type: "removed",
          storyErr: false,
          tags: [],
        },
      },
      comp7: {
        view7: {
          id: "comp7--view7",
          title: "comp7",
          name: "view7",
          testData: 192021,
          type: "diff",
          storyErr: false,
          tags: [],
        },
      },
      comp8: {
        view8: {
          id: "comp8--view8",
          title: "comp8",
          name: "view8",
          testData: 222324,
          type: "diff",
          storyErr: false,
          tags: [],
        },
      },
    });
  });
});
