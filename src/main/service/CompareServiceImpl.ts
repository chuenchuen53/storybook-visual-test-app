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
  savedComparisonDir,
  savedReferenceDir,
  savedTestDir,
  screenshotMetadataFilename,
} from "../Filepath";
import { logger } from "../logger";
import { getAllFolders } from "../utils";
import { SavedScreenshotMetadataHelper } from "../data-files/SavedScreenshotMetadataHelper";
import type {
  BranchScreenshotSet,
  CompareResponse,
  CompareResponse$Data,
  GetAvailableSetResponse,
  SavedScreenshotResponse,
} from "../../shared/type";
import type { CompareService } from "./CompareService";
import type { StoriesDiffer } from "../differ/stories-differ/StoriesDiffer";

export class CompareServiceImpl implements CompareService {
  public static instance: CompareService = new CompareServiceImpl();

  public static getInstance() {
    return this.instance;
  }

  private constructor() {}

  public async getAvailableProjects(): Promise<string[]> {
    const [refs, tests] = await Promise.all([getAllFolders(savedReferenceDir), getAllFolders(savedTestDir)]);
    const set = new Set([...refs, ...tests]);
    return Array.from(set);
  }

  public async getAvailableSets(project: string): Promise<GetAvailableSetResponse> {
    const result: GetAvailableSetResponse = {
      ref: [],
      test: [],
    };

    const refDir = path.join(savedReferenceDir, project);
    const testDir = path.join(savedTestDir, project);

    const refExists = await fs.pathExists(refDir);
    const testExists = await fs.pathExists(testDir);

    if (refExists) result.ref = await this.getSetsFromDir(refDir);
    if (testExists) result.test = await this.getSetsFromDir(testDir);

    return result;
  }

  public async compare(refDir: string, testDir: string): Promise<CompareResponse> {
    try {
      const uuid = uuidv4();
      const now = new Date();

      logger.info("Start new comparison");

      const refArr = refDir.split("/");
      const testArr = testDir.split("/");

      const refSetId = refArr[refArr.length - 1];
      const refBranch = refArr[refArr.length - 2];
      const refProject = refArr[refArr.length - 3];

      const testSetId = testArr[testArr.length - 1];
      const testBranch = testArr[testArr.length - 2];
      const testProject = testArr[testArr.length - 3];

      const testSetSavedInfo = (await SavedScreenshotMetadataHelper.read("test", testProject, testBranch, testSetId))!;

      const project = testSetSavedInfo.project;

      await fs.remove(compareDir);

      await fs.ensureDir(compareDir);
      await fs.ensureDir(compareDiffDir);
      await fs.ensureDir(compareRemovedDir);
      await fs.ensureDir(compareAddedDir);

      const differ: StoriesDiffer = new StoriesDifferImpl();
      const tolerance = 5;
      const result = await differ.computeDiff(refDir, testDir, tolerance);
      const metadata: CompareResponse$Data = {
        uuid,
        createdAt: now.toISOString(),
        project,
        refBranch,
        testBranch,
        refSetId,
        testSetId,
        result,
      };
      const metadataFilepath = path.join(compareDir, compareMetadataFilename);
      await fs.writeJson(metadataFilepath, metadata);

      logger.info("Comparison finished");

      return { success: true, data: metadata };
    } catch (e) {
      logger.error(e);
      return { success: false, data: null };
    }
  }

  public async saveComparison(): Promise<SavedScreenshotResponse> {
    try {
      const metadata = await fs.readJSON(path.join(compareDir, compareMetadataFilename));
      const { uuid, project } = metadata;

      const destDir = path.join(savedComparisonDir, project, uuid);
      await fs.copy(compareDir, destDir, { overwrite: true });
      return { success: true };
    } catch (e) {
      logger.error(e);
      const typedError = e as Error;
      return { success: false, errMsg: typedError.message };
    }
  }

  private async getSetsFromDir(dir: string): Promise<BranchScreenshotSet[]> {
    const branches = await getAllFolders(dir);

    return await Promise.all(
      branches.map(async branch => {
        const branchDir = path.join(dir, branch);
        const setList = await getAllFolders(branchDir);
        return {
          branch,
          setList: await Promise.all(
            setList.map(async uuid => {
              const metadata = await fs.readJSON(path.join(branchDir, uuid, screenshotMetadataFilename));
              return {
                uuid,
                createdAt: metadata.createdAt,
                viewport: metadata.viewport,
              };
            }),
          ),
        };
      }),
    );
  }
}
