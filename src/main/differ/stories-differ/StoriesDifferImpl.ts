import path from "path";
import fs from "fs-extra";
import { PixelmatchDiffer } from "../img-differ/PixelmatchDiffer";
import { computeArrDiff } from "../../utils";
import {
  compareAddedDir,
  compareDiffDir,
  compareDir,
  compareRemovedDir,
  compareResultFilename,
  screenshotMetadataFilename,
} from "../../Filepath";
import type { StoriesDiffer, StoriesDiffResult } from "./StoriesDiffer";
import type { SavedMetadata } from "../../crawler/type";
import type { ImgDiffer } from "../img-differ/ImgDiffer";

export class StoriesDifferImpl implements StoriesDiffer {
  public async computeDiff(refDir: string, testDir: string, tolerance: number): Promise<StoriesDiffResult> {
    const result: StoriesDiffResult = {
      same: [],
      added: [],
      removed: [],
      diff: [],
    };

    const [refMetadata, testMetadata] = await Promise.all([this.readMetadata(refDir), this.readMetadata(testDir)]);

    const refIds = refMetadata.storyMetadataList.map(x => x.id);
    const testIds = testMetadata.storyMetadataList.map(x => x.id);

    const arrDiff = computeArrDiff(refIds, testIds);
    const sameIds = arrDiff.same;
    const addedIds = arrDiff.added;
    const removedIds = arrDiff.removed;

    result.added = [...addedIds];
    result.removed = [...removedIds];

    const copyAddedPromises = addedIds.map(id => {
      const oriImg = path.join(testDir, id + ".png");
      const destImg = path.join(compareAddedDir, id + ".png");
      return fs.copy(oriImg, destImg);
    });

    const copyRemovedPromises = removedIds.map(id => {
      const oriImg = path.join(refDir, id + ".png");
      const destImg = path.join(compareRemovedDir, id + ".png");
      return fs.copy(oriImg, destImg);
    });

    await Promise.all([...copyAddedPromises, ...copyRemovedPromises]);

    const imgDiffer: ImgDiffer = new PixelmatchDiffer();

    for (const id of sameIds) {
      const refPath = path.join(refDir, id + ".png");
      const testPath = path.join(testDir, id + ".png");
      const diffPath = path.join(compareDiffDir, id + ".png");

      const isSame = await imgDiffer.isSame(refPath, testPath, diffPath, tolerance);
      if (isSame) {
        result.same.push(id);
      } else {
        result.diff.push(id);
      }
    }

    const resultPath = path.join(compareDir, compareResultFilename);
    await fs.writeJson(resultPath, result);

    return result;
  }

  private async readMetadata(dir: string): Promise<SavedMetadata> {
    const metadataPath = path.join(dir, screenshotMetadataFilename);
    return fs.readJson(metadataPath);
  }
}
