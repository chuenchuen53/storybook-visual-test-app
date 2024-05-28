import { describe, expect, it } from "vitest";
import { generateTreeFromRespData } from "@renderer/components/compare/comparison-result-explorer/helper";
import type { ComparisonResponse$Data } from "@shared/type";

describe("generateTreeFromRespData", () => {
  // Function handles empty result arrays for same, added, removed, and diff without errors
  it("should handle empty result arrays without errors", () => {
    const data: ComparisonResponse$Data = {
      id: "124",
      createdAt: "2023-01-02T00:00:00Z",
      project: "ProjectY",
      refBranch: "dev",
      testBranch: "release",
      refSetId: "ref124",
      testSetId: "test124",
      result: {
        same: [],
        added: [],
        removed: [],
        diff: [],
      },
    };

    expect(generateTreeFromRespData(data, "same")).toEqual({});
    expect(generateTreeFromRespData(data, "diff")).toEqual({});
    expect(generateTreeFromRespData(data, "added")).toEqual({});
    expect(generateTreeFromRespData(data, "removed")).toEqual({});
  });

  // Function processes a CompareResponse with multiple entries in each result type correctly
  it("should correctly process multiple entries in each result type", () => {
    const compareResponse = {
      uuid: "123",
      createdAt: "2023-01-01T00:00:00Z",
      project: "ProjectX",
      refBranch: "main",
      testBranch: "feature",
      refSetId: "ref123",
      testSetId: "test123",
      result: {
        same: ["comp1--view1", "comp2--view2"],
        added: ["comp3--view3", "comp4--view4"],
        removed: ["comp5--view5", "comp6--view6"],
        diff: ["comp7--view7", "comp8--view8"],
      },
    };

    const expectedObj = {
      same: {
        comp1: { view1: { storyId: "comp1--view1", resultType: "same" } },
        comp2: { view2: { storyId: "comp2--view2", resultType: "same" } },
      },
      added: {
        comp3: { view3: { storyId: "comp3--view3", resultType: "added" } },
        comp4: { view4: { storyId: "comp4--view4", resultType: "added" } },
      },
      removed: {
        comp5: { view5: { storyId: "comp5--view5", resultType: "removed" } },
        comp6: { view6: { storyId: "comp6--view6", resultType: "removed" } },
      },
      diff: {
        comp7: { view7: { storyId: "comp7--view7", resultType: "diff" } },
        comp8: { view8: { storyId: "comp8--view8", resultType: "diff" } },
      },
    };

    expect(generateTreeFromRespData(compareResponse, "same")).toEqual(expectedObj.same);
    expect(generateTreeFromRespData(compareResponse, "added")).toEqual(expectedObj.added);
    expect(generateTreeFromRespData(compareResponse, "removed")).toEqual(expectedObj.removed);
    expect(generateTreeFromRespData(compareResponse, "diff")).toEqual(expectedObj.diff);
  });
});
