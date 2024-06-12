import path from "path";
import { PixelmatchDiffer } from "../img-differ/PixelmatchDiffer";
import { computeArrDiff } from "../../utils";
import { FilepathHelper } from "../../Filepath";
import { SavedScreenshotMetadataHelper } from "../../persistence/SavedScreenshotMetadataHelper";
import type { StoriesDiffResult, StoryMetadataWithRenderStatus } from "../../../shared/type";
import type { StoriesDiffer } from "./StoriesDiffer";
import type { ImgDiffer } from "../img-differ/ImgDiffer";

export class StoriesDifferImpl implements StoriesDiffer {
  public async computeDiff(refDir: string, testDir: string, tolerance: number): Promise<StoriesDiffResult> {
    const result: StoriesDiffResult = {
      same: [],
      added: [],
      removed: [],
      diff: [],
      skip: [],
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

    const testStoryMap = new Map<string, StoryMetadataWithRenderStatus>();
    for (const story of testMetadata.storyMetadataList) {
      testStoryMap.set(story.id, story);
    }

    const arrDiff = computeArrDiff(refStoryIds, testStoryIds);
    const sameIds = arrDiff.same;
    const addedIds = arrDiff.added;
    const removedIds = arrDiff.removed;

    result.added = [...addedIds];
    result.removed = [...removedIds];

    const imgDiffer: ImgDiffer = new PixelmatchDiffer();

    for (const id of sameIds) {
      const metadata = testStoryMap.get(id);
      if (metadata?.skip) {
        result.skip.push(id);
        continue;
      }

      const refPath = path.join(refDir, id + ".png");
      const testPath = path.join(testDir, id + ".png");
      const diffPath = FilepathHelper.tempComparisonDiffImgPath(id + ".png");

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
