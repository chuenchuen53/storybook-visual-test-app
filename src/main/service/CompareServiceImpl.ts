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
  savedInfoFilename,
  savedReferenceDir,
  savedTestDir,
  screenshotMetadataFilename,
} from "../Filepath";
import { logger } from "../logger";
import { getAllFolders } from "../utils";
import type {
  CompareResponse,
  CompareResponse$Data,
  GetAvailableSetResponse,
  SavedScreenshotResponse,
  BranchScreenshotSet,
} from "../../interface";
import type { CompareService } from "./CompareService";
import type { StoriesDiffer } from "../differ/stories-differ/StoriesDiffer";

export class CompareServiceImpl implements CompareService {
  public static instance: CompareService = new CompareServiceImpl();

  private constructor() {
    // singleton
  }

  public static getInstance() {
    return this.instance;
  }

  public async getAvailableProjects(): Promise<string[]> {
    return getAllFolders(savedReferenceDir);
  }

  public async getAvailableSets(projectName: string): Promise<GetAvailableSetResponse> {
    const result: GetAvailableSetResponse = {
      ref: [],
      test: [],
    };

    const refDir = path.join(savedReferenceDir, projectName);
    const testDir = path.join(savedTestDir, projectName);

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
      const metadata: CompareResponse$Data = {
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
      return { success: false, errMsg: e.message };
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
                // todo rename
                createAt: metadata.createAt,
                viewport: metadata.viewport,
              };
            }),
          ),
        };
      }),
    );
  }
}
