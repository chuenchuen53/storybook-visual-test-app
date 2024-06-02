import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { StoriesDifferImpl } from "../differ/stories-differ/StoriesDifferImpl";
import { FilepathHelper } from "../Filepath";
import { getAllFolders } from "../utils";
import { SavedScreenshotMetadataHelper } from "../persistence/SavedScreenshotMetadataHelper";
import { Log } from "../decorator/Log";
import { CatchError } from "../decorator/CatchError";
import { TempComparisonMetadataHelper } from "../persistence/TempComparisonMetadataHelper";
import { SavedComparisonMetadataHelper } from "../persistence/SavedComparisonMetadataHelper";
import { LogError } from "../decorator/LogError";
import type {
  BranchScreenshotSet,
  ComparisonResponse,
  TempComparisonMetadata,
  GetAvailableSetResponse,
  SavedComparisonMetadata,
  SaveScreenshotResponse,
  SaveScreenshotType,
  RefTestSetLocationIdentifier,
  SetItem,
  StoryMetadataWithRenderStatus,
} from "../../shared/type";
import type { ComparisonService } from "./ComparisonService";
import type { StoriesDiffer } from "../differ/stories-differ/StoriesDiffer";

export class ComparisonServiceImpl implements ComparisonService {
  public static instance: ComparisonService = new ComparisonServiceImpl();

  public static getInstance() {
    return this.instance;
  }

  private constructor() {}

  @LogError()
  public async getAvailableSets(project: string): Promise<GetAvailableSetResponse> {
    const result: GetAvailableSetResponse = {
      ref: [],
      test: [],
    };

    const refProjectDir = FilepathHelper.savedRefTestProjectDir("reference", project);
    const testProjectDir = FilepathHelper.savedRefTestProjectDir("test", project);

    const refExists = await fs.pathExists(refProjectDir);
    const testExists = await fs.pathExists(testProjectDir);

    if (refExists) result.ref = await this.getSetsFromDir("reference", project);
    if (testExists) result.test = await this.getSetsFromDir("test", project);

    return result;
  }

  @CatchError<ComparisonResponse>({ success: false, data: null, storyMetadataList: null })
  @Log()
  public async compare(
    refSet: RefTestSetLocationIdentifier,
    testSet: RefTestSetLocationIdentifier,
  ): Promise<ComparisonResponse> {
    const id = uuidv4();
    const now = new Date();

    const refSetId = refSet.setId;
    const refBranch = refSet.branch;
    const refProject = refSet.project;

    const testSetId = testSet.setId;
    const testBranch = testSet.branch;
    const testProject = testSet.project;

    const refSetMetadata = await SavedScreenshotMetadataHelper.read("reference", refProject, refBranch, refSetId);
    const testSetMetadata = await SavedScreenshotMetadataHelper.read("test", testProject, testBranch, testSetId);

    if (!refSetMetadata || !testSetMetadata) {
      throw new Error("Metadata not found for provided ref or test directory.");
    }

    const project = testSetMetadata.project;

    await fs.emptydir(FilepathHelper.tempComparisonDir());
    await fs.ensureDir(FilepathHelper.tempComparisonDiffDir());

    const refDir = FilepathHelper.savedRefTestSetDir("reference", refProject, refBranch, refSetId);
    const testDir = FilepathHelper.savedRefTestSetDir("test", testProject, testBranch, testSetId);

    const differ: StoriesDiffer = new StoriesDifferImpl();
    const tolerance = 5;
    const result = await differ.computeDiff(refDir, testDir, tolerance);

    const map = new Map<string, StoryMetadataWithRenderStatus>();
    for (const x of refSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }
    for (const x of testSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }
    const storyMetadataList = Array.from(map.values());

    const metadata: TempComparisonMetadata = {
      id,
      createdAt: now.toISOString(),
      project,
      refBranch,
      refSetId,
      refSetName: refSetMetadata.name,
      testBranch,
      testSetId,
      testSetName: testSetMetadata.name,
      viewport: refSetMetadata.viewport,
      result,
    };
    await TempComparisonMetadataHelper.save(metadata);

    return { success: true, data: metadata, storyMetadataList };
  }

  @CatchError<SaveScreenshotResponse>(e => ({
    success: false,
    errMsg: e instanceof Error ? e.message : "Unknown error",
  }))
  @Log()
  public async save(name: string): Promise<SaveScreenshotResponse> {
    const metadata = await TempComparisonMetadataHelper.read();
    if (!metadata) throw new Error("No comparison metadata found");

    const { id, project } = metadata;
    const srcDir = FilepathHelper.tempComparisonDir();
    const destDir = FilepathHelper.savedComparisonSetDir(project, id);
    await fs.copy(srcDir, destDir, { overwrite: true });
    const savedMetadata: SavedComparisonMetadata = {
      id: metadata.id,
      createdAt: metadata.createdAt,
      project: metadata.project,
      name,
      refBranch: metadata.refBranch,
      refSetId: metadata.refSetId,
      refSetName: metadata.refSetName,
      testBranch: metadata.testBranch,
      testSetId: metadata.testSetId,
      testSetName: metadata.testSetName,
      viewport: metadata.viewport,
      result: metadata.result,
    };
    await SavedComparisonMetadataHelper.save(savedMetadata);
    return { success: true };
  }

  private async getSetsFromDir(type: SaveScreenshotType, project: string): Promise<BranchScreenshotSet[]> {
    const projectDir = FilepathHelper.savedRefTestProjectDir(type, project);
    const branches = await getAllFolders(projectDir);

    return await Promise.all(
      branches.map(async branch => {
        const branchDir = path.join(projectDir, branch);
        const setIds = await getAllFolders(branchDir);
        const setList = (
          await Promise.all(
            setIds.map<Promise<SetItem | null>>(async id => {
              const metadata = await SavedScreenshotMetadataHelper.read(type, project, branch, id);
              return metadata
                ? {
                    id,
                    createdAt: metadata.createdAt,
                    viewport: metadata.viewport,
                    name: metadata.name,
                  }
                : null;
            }),
          )
        ).filter((x): x is SetItem => x !== null);
        return {
          branch,
          setList,
        };
      }),
    );
  }
}
