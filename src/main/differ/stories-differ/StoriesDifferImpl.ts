import path from "path";
import fs from "fs-extra";
import { PixelmatchDiffer } from "../img-differ/PixelmatchDiffer";
import { computeArrDiff } from "../../utils";
import { comparisonAddedDir, comparisonDiffDir, comparisonRemovedDir } from "../../Filepath";
import { SavedScreenshotMetadataHelper } from "../../data-files/SavedScreenshotMetadataHelper";
import type { StoriesDiffResult } from "../../../shared/type";
import type { StoriesDiffer } from "./StoriesDiffer";
import type { ImgDiffer } from "../img-differ/ImgDiffer";

export class StoriesDifferImpl implements StoriesDiffer {
  public async computeDiff(refDir: string, testDir: string, tolerance: number): Promise<StoriesDiffResult> {
    const result: StoriesDiffResult = {
      same: [],
      added: [],
      removed: [],
      diff: [],
    };

    const [refMetadata, testMetadata] = await Promise.all([
      SavedScreenshotMetadataHelper.readInDir(refDir),
      SavedScreenshotMetadataHelper.readInDir(testDir),
    ]);

    if (!refMetadata || !testMetadata) {
      throw new Error("Metadata not found for provided ref or test directory.");
    }

    const refStoryIds = refMetadata.storyMetadataList.map(x => x.id);
    const testStoryIds = testMetadata.storyMetadataList.map(x => x.id);

    const arrDiff = computeArrDiff(refStoryIds, testStoryIds);
    const sameIds = arrDiff.same;
    const addedIds = arrDiff.added;
    const removedIds = arrDiff.removed;

    result.added = [...addedIds];
    result.removed = [...removedIds];

    const copyAddedPromises = addedIds.map(id => {
      const oriImg = path.join(testDir, id + ".png");
      const destImg = path.join(comparisonAddedDir, id + ".png");
      return fs.copy(oriImg, destImg);
    });

    const copyRemovedPromises = removedIds.map(id => {
      const oriImg = path.join(refDir, id + ".png");
      const destImg = path.join(comparisonRemovedDir, id + ".png");
      return fs.copy(oriImg, destImg);
    });

    await Promise.all([...copyAddedPromises, ...copyRemovedPromises]);

    const imgDiffer: ImgDiffer = new PixelmatchDiffer();

    for (const id of sameIds) {
      const refPath = path.join(refDir, id + ".png");
      const testPath = path.join(testDir, id + ".png");
      const diffPath = path.join(comparisonDiffDir, id + ".png");

      const isSame = await imgDiffer.isSame(refPath, testPath, diffPath, tolerance);
      if (isSame) {
        result.same.push(id);
      } else {
        result.diff.push(id);
      }
    }

    return result;
  }
}
