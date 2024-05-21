import { describe, expect, it } from "vitest";
import { computeArrDiff } from "src/main/utils";

describe("computeArrDiff", () => {
  // Both arrays have no common elements
  it("should identify no common elements when arrays are completely different", () => {
    const oriArr = ["a", "b", "c"];
    const newArr = ["d", "e", "f"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual([]);
    expect(result.added).toEqual(["d", "e", "f"]);
    expect(result.removed).toEqual(["a", "b", "c"]);
  });

  // Arrays contain duplicate elements
  it("should handle duplicate elements correctly", () => {
    const oriArr = ["a", "b", "b", "c"];
    const newArr = ["a", "a", "d", "e"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual(["a"]);
    expect(result.added).toEqual(["d", "e"]);
    expect(result.removed).toEqual(["b", "b", "c"]);
  });

  // Both arrays have all elements in common
  it("should identify all common elements when arrays are the same", () => {
    const oriArr = ["a", "b", "c"];
    const newArr = ["a", "b", "c"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual(["a", "b", "c"]);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  // Original array has elements not in new array
  it("should identify elements in original array that are not in new array", () => {
    const oriArr = ["a", "b", "c", "d"];
    const newArr = ["a", "c", "e"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual(["a", "c"]);
    expect(result.added).toEqual(["e"]);
    expect(result.removed).toEqual(["b", "d"]);
  });

  // Both arrays are empty
  it("should identify no common elements when both arrays are empty", () => {
    const oriArr: string[] = [];
    const newArr: string[] = [];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual([]);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  // New array has elements not in original array
  it("should identify elements in new array that are not in original array", () => {
    const oriArr = ["a", "b", "c"];
    const newArr = ["b", "c", "d", "e"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual(["b", "c"]);
    expect(result.added).toEqual(["d", "e"]);
    expect(result.removed).toEqual(["a"]);
  });

  // Original array is empty and new array has elements
  it("should identify no common elements when original array is empty and new array has elements", () => {
    const oriArr: string[] = [];
    const newArr = ["d", "e", "f"];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual([]);
    expect(result.added).toEqual(["d", "e", "f"]);
    expect(result.removed).toEqual([]);
  });

  // New array is empty and original array has elements
  it("should identify all elements as removed when new array is empty", () => {
    const oriArr = ["a", "b", "c"];
    const newArr: string[] = [];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual([]);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual(["a", "b", "c"]);
  });

  // Verify immutability of input arrays
  it("should maintain input arrays unchanged", () => {
    const oriArr = ["a", "b", "c"];
    const newArr = ["d", "e", "f"];
    const oriArrCopy = [...oriArr];
    const newArrCopy = [...newArr];
    computeArrDiff(oriArr, newArr);
    expect(oriArr).toEqual(oriArrCopy);
    expect(newArr).toEqual(newArrCopy);
  });

  // Arrays with elements that only differ in whitespace
  it("should identify no common elements when arrays have elements that only differ in whitespace", () => {
    const oriArr = ["a", "b", "c"];
    const newArr = [" a ", " b ", " c "];
    const result = computeArrDiff(oriArr, newArr);
    expect(result.same).toEqual([]);
    expect(result.added).toEqual([" a ", " b ", " c "]);
    expect(result.removed).toEqual(["a", "b", "c"]);
  });
});
