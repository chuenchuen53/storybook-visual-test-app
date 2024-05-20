import path from "path";
import fs from "fs-extra";
import { PixelmatchDiffer } from "../img-differ/PixelmatchDiffer";
import { computeArrDiff } from "../utils";
import { addedImgFolder, diffImgFolder, removedImgFolder } from "../Filepath";
import type { StoriesDiffer, StoriesDiffResult } from "./StoriesDiffer";
import type { SavedMetadata } from "../crawler/type";
import type { ImgDiffer } from "../img-differ/ImgDiffer";

export class StoriesDifferImpl implements StoriesDiffer {
  private static metadataFilename = "metadata.json";

  public async computeDiff(
    refDir: string,
    testDir: string,
    diffDir: string,
    tolerance: number,
  ): Promise<StoriesDiffResult> {
    const result: StoriesDiffResult = {
      same: [],
      added: [],
      removed: [],
      diff: [],
    };

    const refMetadata = await this.readMetadata(refDir);
    const testMetadata = await this.readMetadata(testDir);

    const refIds = refMetadata.storyMetadataList.map(x => x.id);
    const testIds = testMetadata.storyMetadataList.map(x => x.id);

    const arrDiff = computeArrDiff(refIds, testIds);
    const sameIds = arrDiff.same;
    const addedIds = arrDiff.added;
    const removedIds = arrDiff.removed;

    result.added = [...addedIds];
    result.removed = [...removedIds];

    for (const id of addedIds) {
      const oriImg = path.join(testDir, id + ".png");
      const destImg = path.join(diffDir, addedImgFolder, id + ".png");
      await fs.copy(oriImg, destImg);
    }

    for (const id of removedIds) {
      const oriImg = path.join(refDir, id + ".png");
      const destImg = path.join(diffDir, removedImgFolder, id + ".png");
      await fs.copy(oriImg, destImg);
    }

    const imgDiffer: ImgDiffer = new PixelmatchDiffer();

    for (const id of sameIds) {
      const refPath = path.join(refDir, id + ".png");
      const testPath = path.join(testDir, id + ".png");
      const diffPath = path.join(diffDir, diffImgFolder, id + ".png");

      const isSame = await imgDiffer.isSame(refPath, testPath, diffPath, tolerance);
      if (isSame) {
        result.same.push(id);
      } else {
        result.diff.push(id);
      }
    }

    const resultPath = path.join(diffDir, "result.json");
    await fs.writeJson(resultPath, result);

    return result;
  }

  private async readMetadata(dir: string): Promise<SavedMetadata> {
    const metadataPath = path.join(dir, StoriesDifferImpl.metadataFilename);
    return fs.readJson(metadataPath);
  }
}
