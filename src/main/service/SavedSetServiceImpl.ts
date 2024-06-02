import fs from "fs-extra";
import { getAllFolders, filterNonNull } from "../utils";
import { FilepathHelper } from "../Filepath";
import { SavedScreenshotMetadataHelper } from "../persistence/SavedScreenshotMetadataHelper";
import { SavedComparisonMetadataHelper } from "../persistence/SavedComparisonMetadataHelper";
import { LogError } from "../decorator/LogError";
import { CatchError } from "../decorator/CatchError";
import type {
  ComparisonSavedInfo,
  RefTestSavedInfo,
  GetAllSavedSetsResponse,
  SaveScreenshotType,
  GetAllSavedRefTestSetsResponse,
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
    const [refs, tests] = await Promise.all([
      getAllFolders(FilepathHelper.savedRefDir()),
      getAllFolders(FilepathHelper.savedTestDir()),
    ]);
    const set = new Set([...refs, ...tests]);
    return Array.from(set);
  }

  @LogError()
  public async getAllSavedRefTestSets(project: string): Promise<GetAllSavedRefTestSetsResponse> {
    const [refBranches, testBranches] = await Promise.all([
      this.getAllRefTestBranches("reference", project),
      this.getAllRefTestBranches("test", project),
    ]);

    const [refSetsInfo, testSetsInfo] = await Promise.all([
      (
        await Promise.all(refBranches.map(branch => this.getAllRefTestSetsFromBranch("reference", project, branch)))
      ).flat(),
      (await Promise.all(testBranches.map(branch => this.getAllRefTestSetsFromBranch("test", project, branch)))).flat(),
    ]);

    return {
      ref: this.groupByBranch(this.sortSavedRefTestSets(refSetsInfo)),
      test: this.groupByBranch(this.sortSavedRefTestSets(testSetsInfo)),
    };
  }

  @LogError()
  public async getAllSavedSets(project: string): Promise<GetAllSavedSetsResponse> {
    const [refBranches, testBranches] = await Promise.all([
      this.getAllRefTestBranches("reference", project),
      this.getAllRefTestBranches("test", project),
    ]);

    const [refSetsInfo, testSetsInfo, comparisonSets] = await Promise.all([
      (
        await Promise.all(refBranches.map(branch => this.getAllRefTestSetsFromBranch("reference", project, branch)))
      ).flat(),
      (await Promise.all(testBranches.map(branch => this.getAllRefTestSetsFromBranch("test", project, branch)))).flat(),
      this.getSavedComparisonSets(project),
    ]);

    return {
      ref: this.groupByBranch(this.sortSavedRefTestSets(refSetsInfo)),
      test: this.groupByBranch(this.sortSavedRefTestSets(testSetsInfo)),
      comparison: this.sortCompareSets(comparisonSets),
    };
  }

  @CatchError<null>(null)
  @LogError()
  public async deleteRefTestSet(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<GetAllSavedSetsResponse | null> {
    const dir = FilepathHelper.savedRefTestSetDir(type, project, branch, setId);
    if (!(await fs.pathExists(dir))) return null;
    await fs.remove(dir);
    return await this.getAllSavedSets(project);
  }

  @CatchError<null>(null)
  @LogError()
  public async deleteComparisonSet(project: string, setId: string): Promise<GetAllSavedSetsResponse | null> {
    const dir = FilepathHelper.savedComparisonSetDir(project, setId);
    if (!(await fs.pathExists(dir))) return null;
    await fs.remove(dir);
    return await this.getAllSavedSets(project);
  }

  @CatchError<null>(null)
  @LogError()
  public async deleteRefTestBranch(
    type: SaveScreenshotType,
    project: string,
    branch: string,
  ): Promise<GetAllSavedSetsResponse | null> {
    const dir = FilepathHelper.savedRefTestBranchDir(type, project, branch);
    if (!(await fs.pathExists(dir))) return null;
    await fs.remove(dir);
    return await this.getAllSavedSets(project);
  }

  @CatchError<boolean>(false)
  @LogError()
  public async deleteProject(project: string): Promise<boolean> {
    const refDir = FilepathHelper.savedRefTestProjectDir("reference", project);
    const testDir = FilepathHelper.savedRefTestProjectDir("test", project);
    const comparisonDir = FilepathHelper.savedComparisonProjectDir(project);
    await Promise.all([fs.remove(refDir), fs.remove(testDir), fs.remove(comparisonDir)]);
    return true;
  }

  private async getAllRefTestBranches(type: SaveScreenshotType, project: string): Promise<string[]> {
    const dir = FilepathHelper.savedRefTestProjectDir(type, project);
    if (!(await fs.pathExists(dir))) return [];
    return await getAllFolders(dir);
  }

  private async getAllRefTestSetsFromBranch(
    type: SaveScreenshotType,
    project: string,
    branch: string,
  ): Promise<RefTestSavedInfo[]> {
    const dir = FilepathHelper.savedRefTestBranchDir(type, project, branch);
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
    return filterNonNull(results);
  }

  private async getSavedComparisonSets(project: string): Promise<ComparisonSavedInfo[]> {
    const dir = FilepathHelper.savedComparisonProjectDir(project);
    if (!(await fs.pathExists(dir))) return [];
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<ComparisonSavedInfo | null> => {
      const metadata = await SavedComparisonMetadataHelper.read(project, setId);
      return metadata === null
        ? null
        : {
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

    const results = await Promise.all(allSets.map(getSavedInfo));
    return filterNonNull(results);
  }

  private sortSavedRefTestSets(savedSets: RefTestSavedInfo[]): RefTestSavedInfo[] {
    return savedSets.sort((a, b) => {
      if (a.branch !== b.branch) {
        return a.branch.localeCompare(b.branch);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }

  private sortCompareSets(savedSets: ComparisonSavedInfo[]): ComparisonSavedInfo[] {
    return savedSets.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }

  private groupByBranch(savedSets: RefTestSavedInfo[]): Record<string, Record<string, RefTestSavedInfo>> {
    const branchGroup: Record<string, Record<string, RefTestSavedInfo>> = {};
    for (const set of savedSets) {
      if (!branchGroup[set.branch]) {
        branchGroup[set.branch] = {};
      }
      branchGroup[set.branch][set.id] = set;
    }
    return branchGroup;
  }
}
