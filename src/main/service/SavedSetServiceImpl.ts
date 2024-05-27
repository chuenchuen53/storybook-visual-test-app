import path from "path";
import fs from "fs-extra";
import { getAllFolders } from "../utils";
import {
  compareMetadataFilename,
  savedComparisonDir,
  savedReferenceDir,
  savedTestDir,
  screenshotMetadataFilename,
} from "../Filepath";
import { logger } from "../logger";
import type {
  CompareResponse$Data,
  ComparisonSavedInfo,
  RefTestSavedInfo,
  SavedMetadata,
  SavedSets,
  SaveScreenshotType,
  StoryScreenshotMetadata,
} from "../../shared/type";
import type { SavedSetService } from "./SavedSetService";

export class SavedSetServiceImpl implements SavedSetService {
  private static instance: SavedSetService = new SavedSetServiceImpl();

  private constructor() {
    // singleton
  }

  public static getInstance(): SavedSetService {
    return SavedSetServiceImpl.instance;
  }

  public async getAllRefOrTestBranches(type: SaveScreenshotType, project: string): Promise<string[]> {
    let dir = type === "reference" ? savedReferenceDir : savedTestDir;
    dir = path.join(dir, project);
    if (!(await fs.pathExists(dir))) return [];
    return await getAllFolders(dir);
  }

  public async getAllRefOrTestSavedSets(
    type: SaveScreenshotType,
    project: string,
    branch: string,
  ): Promise<RefTestSavedInfo[]> {
    let dir = type === "reference" ? savedReferenceDir : savedTestDir;
    dir = path.join(dir, project, branch);
    logger.info(dir);
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<RefTestSavedInfo | null> => {
      const metadataPath = path.join(dir, setId, screenshotMetadataFilename);
      const exist = await fs.pathExists(metadataPath);
      if (!exist) return null;
      const metadata: SavedMetadata = await fs.readJSON(metadataPath);

      return {
        id: metadata.uuid,
        createdAt: metadata.createAt,
        type,
        project,
        branch,
        viewport: metadata.viewport,
        name: "todo",
        fileSize: "todo",
        stories: metadata.storyMetadataList.length,
        errStories: metadata.storyMetadataList.reduce((acc, cur) => acc + (cur.storyErr ? 1 : 0), 0),
      };
    };

    const results = await Promise.all(allSets.map(getSavedInfo));
    return results.filter((info): info is RefTestSavedInfo => info !== null);
  }

  public async getAllSavedSets(project: string): Promise<SavedSets> {
    const refSets = await this.getAllRefOrTestBranches("reference", project);
    const testSets = await this.getAllRefOrTestBranches("test", project);

    const refSetsInfo = (
      await Promise.all(refSets.map(branch => this.getAllRefOrTestSavedSets("reference", project, branch)))
    ).flat();
    const testSetsInfo = (
      await Promise.all(testSets.map(branch => this.getAllRefOrTestSavedSets("test", project, branch)))
    ).flat();
    const comparisonSets = await this.getSaveComparisonSets(project);

    return {
      ref: this.sortSavedRefTestSets(refSetsInfo),
      test: this.sortSavedRefTestSets(testSetsInfo),
      comparison: this.sortCompareSets(comparisonSets),
    };
  }

  private async getSaveComparisonSets(project: string): Promise<ComparisonSavedInfo[]> {
    const dir = path.join(savedComparisonDir, project);
    if (!(await fs.pathExists(dir))) return [];
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<ComparisonSavedInfo | null> => {
      const metadataPath = path.join(dir, setId, compareMetadataFilename);
      const exist = await fs.pathExists(metadataPath);
      if (!exist) return null;
      const metadata: CompareResponse$Data = await fs.readJSON(metadataPath);

      return {
        id: metadata.uuid,
        createdAt: metadata.createAt,
        project,
        name: "todo",
        refBranch: metadata.refBranch,
        testBranch: metadata.testBranch,
        refSetId: metadata.refId,
        testSetId: metadata.testSetId,
        refSetName: "todo",
        testSetName: "todo",
        // todo
        viewport: {
          width: 123,
          height: 456,
        },
        result: {
          same: metadata.result.same.length,
          added: metadata.result.added.length,
          removed: metadata.result.removed.length,
          diff: metadata.result.diff.length,
        },
      };
    };

    return (await Promise.all(allSets.map(getSavedInfo))).filter((info): info is ComparisonSavedInfo => info !== null);
  }

  public async getRefOrTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryScreenshotMetadata[]> {
    let dir = type === "reference" ? savedReferenceDir : savedTestDir;
    dir = path.join(dir, project, branch, setId);
    const metadataPath = path.join(dir, screenshotMetadataFilename);
    const exist = await fs.pathExists(metadataPath);
    if (!exist) return [];
    const metadata: SavedMetadata = await fs.readJSON(metadataPath);
    return metadata.storyMetadataList;
  }

  private sortSavedRefTestSets(savedSets: RefTestSavedInfo[]): RefTestSavedInfo[] {
    return savedSets.sort((a, b) => {
      if (a.branch !== b.branch) {
        return a.branch.localeCompare(b.branch);
      }
      if (a.viewport.width !== b.viewport.width) {
        return a.viewport.width - b.viewport.width;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }

  private sortCompareSets(savedSets: ComparisonSavedInfo[]): ComparisonSavedInfo[] {
    return savedSets.sort((a, b) => {
      if (a.testBranch !== b.testBranch) {
        return a.testBranch.localeCompare(b.testBranch);
      }
      if (a.viewport.width !== b.viewport.width) {
        return a.viewport.width - b.viewport.width;
      }
      if (a.refBranch !== b.refBranch) {
        return a.refBranch.localeCompare(b.refBranch);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }
}
