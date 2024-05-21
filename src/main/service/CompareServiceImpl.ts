import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { StoriesDifferImpl } from "../differ/stories-differ/StoriesDifferImpl";
import {
  compareAddedDir,
  compareDiffDir,
  compareDir,
  compareMetadataFilename,
  compareRemovedDir,
  savedInfoFilename,
} from "../Filepath";
import { logger } from "../logger";
import type { CompareService } from "./CompareService";
import type { CompareResponse } from "../../interface";
import type { StoriesDiffer } from "../differ/stories-differ/StoriesDiffer";

export class CompareServiceImpl implements CompareService {
  public static instance = new CompareServiceImpl();

  private constructor() {
    // singleton
  }

  public static getInstance() {
    return this.instance;
  }

  public async compare(refDir: string, testDir: string) {
    const uuid = uuidv4();
    const now = new Date();

    logger.info("Start new comparison");

    const refSavedInfoFilepath = path.join(refDir, savedInfoFilename);
    const refSavedInfo = await fs.readJSON(refSavedInfoFilepath);
    const testSetSavedInfoFilepath = path.join(testDir, savedInfoFilename);
    const testSetSavedInfo = await fs.readJSON(testSetSavedInfoFilepath);

    // todo: change naming
    const refId = refSavedInfo.uuid;
    const testSetId = testSetSavedInfo.uuid;

    const project = testSetSavedInfo.project;

    const refBranch = refSavedInfo.branch;
    const testBranch = testSetSavedInfo.branch;

    await fs.remove(compareDir);

    await fs.ensureDir(compareDir);
    await fs.ensureDir(compareDiffDir);
    await fs.ensureDir(compareRemovedDir);
    await fs.ensureDir(compareAddedDir);

    const differ: StoriesDiffer = new StoriesDifferImpl();
    const tolerance = 5;
    const result = await differ.computeDiff(refDir, testDir, tolerance);
    const metadata: CompareResponse = {
      uuid,
      // todo naming
      createAt: now.toISOString(),
      project,
      refBranch,
      testBranch,
      refId,
      testSetId,
      result,
    };
    const metadataFilepath = path.join(compareDir, compareMetadataFilename);
    await fs.writeJson(metadataFilepath, metadata);

    logger.info("Comparison finished");

    return metadata;
  }
}
