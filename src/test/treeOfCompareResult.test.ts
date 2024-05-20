import { describe, expect, it } from "vitest";
import { treeOfCompareResult } from "../view/utils";
import type { CompareResponse } from "src/interface";

describe("treeOfCompareResult", () => {
  // Function handles empty result arrays for same, added, removed, and diff without errors
  it("should handle empty result arrays without errors", () => {
    const compareResponse: CompareResponse = {
      uuid: "124",
      createAt: "2023-01-02T00:00:00Z",
      project: "ProjectY",
      refBranch: "dev",
      testBranch: "release",
      refId: "ref124",
      testSetId: "test124",
      result: {
        same: [],
        added: [],
        removed: [],
        diff: [],
      },
    };
    const result = treeOfCompareResult(compareResponse);
    expect(result).toEqual({
      same: {},
      added: {},
      removed: {},
      diff: {},
    });
  });

  // Function processes a CompareResponse with multiple entries in each result type correctly
  it("should correctly process multiple entries in each result type", () => {
    const compareResponse = {
      uuid: "123",
      createAt: "2023-01-01T00:00:00Z",
      project: "ProjectX",
      refBranch: "main",
      testBranch: "feature",
      refId: "ref123",
      testSetId: "test123",
      result: {
        same: ["comp1--view1", "comp2--view2"],
        added: ["comp3--view3", "comp4--view4"],
        removed: ["comp5--view5", "comp6--view6"],
        diff: ["comp7--view7", "comp8--view8"],
      },
    };
    const result = treeOfCompareResult(compareResponse);
    expect(result).toEqual({
      same: {
        comp1: { view1: { storyId: "comp1--view1" } },
        comp2: { view2: { storyId: "comp2--view2" } },
      },
      added: {
        comp3: { view3: { storyId: "comp3--view3" } },
        comp4: { view4: { storyId: "comp4--view4" } },
      },
      removed: {
        comp5: { view5: { storyId: "comp5--view5" } },
        comp6: { view6: { storyId: "comp6--view6" } },
      },
      diff: {
        comp7: { view7: { storyId: "comp7--view7" } },
        comp8: { view8: { storyId: "comp8--view8" } },
      },
    });
  });
});
