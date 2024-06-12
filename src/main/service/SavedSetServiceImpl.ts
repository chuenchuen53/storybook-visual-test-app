import fs from "fs-extra";
import { getAllFolders, filterNonNull } from "../utils";
import { FilepathHelper } from "../Filepath";
import { SavedScreenshotMetadataHelper } from "../persistence/SavedScreenshotMetadataHelper";
import { SavedComparisonMetadataHelper } from "../persistence/SavedComparisonMetadataHelper";
import { LogError } from "../decorator/LogError";
import { CatchError } from "../decorator/CatchError";
import type {
  SavedComparisonInfo,
  SavedScreenshotSetInfo,
  GetAllSavedSetsResponse,
  GetAllSavedScreenshotSetsResponse,
  StoryMetadataWithRenderStatus,
  GetSavedComparisonMetadataResponse,
  GetSavedScreenshotMetadataResponse,
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
    const dir = FilepathHelper.savedScreenshotDir();
    if (!(await fs.pathExists(dir))) return [];
    return getAllFolders(dir);
  }

  @LogError()
  public async getAllSavedBranches(project: string): Promise<string[]> {
    return this.getAllScreenshotBranches(project);
  }

  @LogError()
  public async getAllSavedScreenshotSets(project: string): Promise<GetAllSavedScreenshotSetsResponse> {
    const allBranches = await this.getAllScreenshotBranches(project);
    const entries = await Promise.all(
      allBranches.map(async branch => {
        const sets = await this.getAllScreenshotSetsFromBranch(project, branch);
        const sortedSets = this.sortScreenshotSets(sets);
        return [branch, sortedSets];
      }),
    );
    const groupedSets = Object.fromEntries(entries);

    return { screenshot: groupedSets };
  }

  @LogError()
  public async getAllSavedSets(project: string): Promise<GetAllSavedSetsResponse> {
    const [screenshotData, comparison] = await Promise.all([
      this.getAllSavedScreenshotSets(project),
      this.getSavedComparisonSets(project),
    ]);

    return {
      screenshot: screenshotData.screenshot,
      comparison: this.sortCompareSets(comparison),
    };
  }

  @LogError()
  public async getSavedScreenshotMetadata(
    project: string,
    branch: string,
    setId: string,
  ): Promise<GetSavedScreenshotMetadataResponse> {
    const data = await SavedScreenshotMetadataHelper.read(project, branch, setId);
    return { data };
  }

  @LogError()
  public async getSavedComparisonMetadata(project: string, setId: string): Promise<GetSavedComparisonMetadataResponse> {
    const metadata = await SavedComparisonMetadataHelper.read(project, setId);

    if (metadata === null) return { data: null };

    const [refSetMetadata, testSetMetadata] = await Promise.all([
      SavedScreenshotMetadataHelper.read(project, metadata.refBranch, metadata.refSetId),
      SavedScreenshotMetadataHelper.read(project, metadata.testBranch, metadata.testSetId),
    ]);

    if (refSetMetadata === null || testSetMetadata === null) return { data: null };

    const map = new Map<string, StoryMetadataWithRenderStatus>();
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

  @CatchError<null>(null)
  @LogError()
  public async deleteScreenshotSet(
    project: string,
    branch: string,
    setId: string,
  ): Promise<GetAllSavedSetsResponse | null> {
    const dir = FilepathHelper.savedScreenshotSetDir(project, branch, setId);
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
  public async deleteScreenshotBranch(project: string, branch: string): Promise<GetAllSavedSetsResponse | null> {
    const dir = FilepathHelper.savedScreenshotBranchDir(project, branch);
    if (!(await fs.pathExists(dir))) return null;
    await fs.remove(dir);
    return await this.getAllSavedSets(project);
  }

  @CatchError<boolean>(false)
  @LogError()
  public async deleteProject(project: string): Promise<boolean> {
    const screenshotDir = FilepathHelper.savedScreenshotProjectDir(project);
    const comparisonDir = FilepathHelper.savedComparisonProjectDir(project);
    await Promise.all([fs.remove(screenshotDir), fs.remove(comparisonDir)]);
    return true;
  }

  private async getAllScreenshotBranches(project: string): Promise<string[]> {
    const dir = FilepathHelper.savedScreenshotProjectDir(project);
    if (!(await fs.pathExists(dir))) return [];
    return await getAllFolders(dir);
  }

  private async getAllScreenshotSetsFromBranch(project: string, branch: string): Promise<SavedScreenshotSetInfo[]> {
    const dir = FilepathHelper.savedScreenshotBranchDir(project, branch);
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<SavedScreenshotSetInfo | null> => {
      const metadata = await SavedScreenshotMetadataHelper.read(project, branch, setId);
      return metadata === null
        ? null
        : {
            id: metadata.id,
            createdAt: metadata.createdAt,
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

  private async getSavedComparisonSets(project: string): Promise<SavedComparisonInfo[]> {
    const dir = FilepathHelper.savedComparisonProjectDir(project);
    if (!(await fs.pathExists(dir))) return [];
    const allSets = await getAllFolders(dir);

    const getSavedInfo = async (setId: string): Promise<SavedComparisonInfo | null> => {
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
              skip: metadata.result.skip.length,
            },
          };
    };

    const results = await Promise.all(allSets.map(getSavedInfo));
    return filterNonNull(results);
  }

  private sortScreenshotSets(savedSets: SavedScreenshotSetInfo[]): SavedScreenshotSetInfo[] {
    return savedSets.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }

  private sortCompareSets(savedSets: SavedComparisonInfo[]): SavedComparisonInfo[] {
    return savedSets.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // desc
    });
  }
}
