import path from "path";
import fs from "fs-extra";
import { getAllFolders } from "../utils";
import { savedComparisonDir, savedReferenceDir, savedTestDir } from "../Filepath";
import { SavedScreenshotMetadataHelper } from "../data-files/SavedScreenshotMetadataHelper";
import { SavedComparisonMetadataHelper } from "../data-files/SavedComparisonMetadataHelper";
import { LogError } from "../decorator/LogError";
import type {
  ComparisonSavedInfo,
  GetComparisonSavedSetMetadataResponse,
  RefTestSavedInfo,
  SavedSets,
  SaveScreenshotType,
  StoryScreenshotMetadata,
} from "../../shared/type";
import type { SavedSetService } from "./SavedSetService";

export class SavedSetServiceImpl implements SavedSetService {
  private static instance: SavedSetService = new SavedSetServiceImpl();

  public static getInstance(): SavedSetService {
    return SavedSetServiceImpl.instance;
  }

  private constructor() {}

  @LogError()
  public async getAllSavedProjects(): Promise<string[]> {
    const [refs, tests] = await Promise.all([getAllFolders(savedReferenceDir), getAllFolders(savedTestDir)]);
    const set = new Set([...refs, ...tests]);
    return Array.from(set);
  }

  @LogError()
  public async getAllSavedSets(project: string): Promise<SavedSets> {
    const [refSets, testSets] = await Promise.all([
      this.getAllRefOrTestBranches("reference", project),
      this.getAllRefOrTestBranches("test", project),
    ]);

    const [refSetsInfo, testSetsInfo, comparisonSets] = await Promise.all([
      (await Promise.all(refSets.map(branch => this.getAllRefOrTestSavedSets("reference", project, branch)))).flat(),
      (await Promise.all(testSets.map(branch => this.getAllRefOrTestSavedSets("test", project, branch)))).flat(),
      this.getSaveComparisonSets(project),
    ]);

    return {
      ref: this.sortSavedRefTestSets(refSetsInfo),
      test: this.sortSavedRefTestSets(testSetsInfo),
      comparison: this.sortCompareSets(comparisonSets),
    };
  }

  @LogError()
  public async getRefOrTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryScreenshotMetadata[]> {
    const metadata = await SavedScreenshotMetadataHelper.read(type, project, branch, setId);
    return metadata === null ? [] : metadata.storyMetadataList;
  }

  @LogError()
  public async getComparisonSavedSetMetadata(
    project: string,
    setId: string,
  ): Promise<GetComparisonSavedSetMetadataResponse> {
    const metadata = await SavedComparisonMetadataHelper.read(project, setId);

    if (metadata === null) return { data: null };

    const refSetMetadata = await SavedScreenshotMetadataHelper.read(
      "reference",
      project,
      metadata.refBranch,
      metadata.refSetId,
    );
    const testSetMetadata = await SavedScreenshotMetadataHelper.read(
      "test",
      project,
      metadata.testBranch,
      metadata.testSetId,
    );

    if (metadata === null || refSetMetadata === null || testSetMetadata === null) return { data: null };

    const map = new Map<string, StoryScreenshotMetadata>();
    for (const x of refSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }
    for (const x of testSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }

    const storyMetadataList = Array.from(map.values());

    return {
      data: {
        metadata,
        storyMetadataList,
      },
    };
  }

  private async getAllRefOrTestBranches(type: SaveScreenshotType, project: string): Promise<string[]> {
    let dir = type === "reference" ? savedReferenceDir : savedTestDir;
    dir = path.join(dir, project);
    if (!(await fs.pathExists(dir))) return [];
    return await getAllFolders(dir);
  }

  private async getAllRefOrTestSavedSets(
    type: SaveScreenshotType,
    project: string,
    branch: string,
  ): Promise<RefTestSavedInfo[]> {
    let dir = type === "reference" ? savedReferenceDir : savedTestDir;
    dir = path.join(dir, project, branch);
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<RefTestSavedInfo | null> => {
      const metadata = await SavedScreenshotMetadataHelper.read(type, project, branch, setId);
      return metadata === null
        ? null
        : {
            id: metadata.id,
            createdAt: metadata.createdAt,
            type: metadata.type,
            project: metadata.project,
            branch: metadata.branch,
            viewport: metadata.viewport,
            name: metadata.name,
            fileSize: metadata.size,
            stories: metadata.storyMetadataList.length,
            errStories: metadata.storyMetadataList.reduce((acc, cur) => acc + (cur.storyErr ? 1 : 0), 0),
          };
    };

    const results = await Promise.all(allSets.map(getSavedInfo));
    return results.filter((info): info is RefTestSavedInfo => info !== null);
  }

  private async getSaveComparisonSets(project: string): Promise<ComparisonSavedInfo[]> {
    const dir = path.join(savedComparisonDir, project);
    if (!(await fs.pathExists(dir))) return [];
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<ComparisonSavedInfo | null> => {
      const metadata = await SavedComparisonMetadataHelper.read(project, setId);

      if (metadata === null) return null;

      return {
        id: metadata.id,
        createdAt: metadata.createdAt,
        project: metadata.project,
        name: metadata.name,
        refBranch: metadata.refBranch,
        refSetId: metadata.refSetId,
        refSetName: metadata.refSetName,
        testBranch: metadata.testBranch,
        testSetId: metadata.testSetId,
        testSetName: metadata.testSetName,
        viewport: metadata.viewport,
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
