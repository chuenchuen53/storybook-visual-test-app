import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { StoriesDifferImpl } from "./stories-differ/StoriesDifferImpl";
import {
  addedImgFolder,
  compareDir,
  compareMetadataFilename,
  diffImgFolder,
  removedImgFolder,
  savedInfoFilename,
} from "./Filepath";
import type { CompareResponse } from "../interface";
import type { StoriesDiffer } from "./stories-differ/StoriesDiffer";

export async function compareService(refDir: string, testDir: string) {
  const uuid = uuidv4();
  const now = new Date();

  const refSavedInfoFilepath = path.join(refDir, savedInfoFilename);
  const refSavedInfo = await fs.readJSON(refSavedInfoFilepath);
  const testSetSavedInfoFilepath = path.join(testDir, savedInfoFilename);
  const testSetSavedInfo = await fs.readJSON(testSetSavedInfoFilepath);

  const refId = refSavedInfo.uuid;
  const testSetId = testSetSavedInfo.uuid;

  const project = testSetSavedInfo.project;

  const refBranch = refSavedInfo.branch;
  const testBranch = testSetSavedInfo.branch;

  const compareRootDir = path.join(compareDir);

  await fs.remove(compareRootDir);

  const diffImgDir = path.join(compareRootDir, diffImgFolder);
  const removedImgDir = path.join(compareRootDir, removedImgFolder);
  const addedImgDir = path.join(compareRootDir, addedImgFolder);

  await fs.ensureDir(compareRootDir);
  await fs.ensureDir(diffImgDir);
  await fs.ensureDir(removedImgDir);
  await fs.ensureDir(addedImgDir);

  const differ: StoriesDiffer = new StoriesDifferImpl();
  const tolerance = 5;
  const result = await differ.computeDiff(refDir, testDir, compareRootDir, tolerance);
  const metadata: CompareResponse = {
    uuid,
    createAt: now.toISOString(),
    project,
    refBranch,
    testBranch,
    refId,
    testSetId,
    result,
  };
  const metadataFilepath = path.join(compareRootDir, compareMetadataFilename);
  await fs.writeJson(metadataFilepath, metadata);
  return metadata;
}
