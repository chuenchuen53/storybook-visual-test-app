import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { StoriesDifferImpl } from "../differ/stories-differ/StoriesDifferImpl";
import { FilepathHelper } from "../Filepath";
import { SavedScreenshotMetadataHelper } from "../persistence/SavedScreenshotMetadataHelper";
import { Log } from "../decorator/Log";
import { CatchError } from "../decorator/CatchError";
import { TempComparisonMetadataHelper } from "../persistence/TempComparisonMetadataHelper";
import { SavedComparisonMetadataHelper } from "../persistence/SavedComparisonMetadataHelper";
import type {
  CreateNewComparisonSetResponse,
  TempComparisonMetadata,
  SavedComparisonMetadata,
  SaveComparisonResponse,
  SavedScreenshotSetLocationIdentifier,
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

  @CatchError<CreateNewComparisonSetResponse>({ success: false, data: null, storyMetadataList: null })
  @Log()
  public async compare(
    refSet: SavedScreenshotSetLocationIdentifier,
    testSet: SavedScreenshotSetLocationIdentifier,
  ): Promise<CreateNewComparisonSetResponse> {
    const refSetId = refSet.setId;
    const refBranch = refSet.branch;
    const refProject = refSet.project;

    const testSetId = testSet.setId;
    const testBranch = testSet.branch;
    const testProject = testSet.project;

    const refSetMetadata = await SavedScreenshotMetadataHelper.read(refProject, refBranch, refSetId);
    const testSetMetadata = await SavedScreenshotMetadataHelper.read(testProject, testBranch, testSetId);

    if (!refSetMetadata || !testSetMetadata) {
      throw new Error("Metadata not found for provided ref or test directory.");
    }

    const project = testSetMetadata.project;

    await fs.emptydir(FilepathHelper.tempComparisonDir());
    await fs.ensureDir(FilepathHelper.tempComparisonDiffDir());

    const refSetDir = FilepathHelper.savedScreenshotSetDir(refProject, refBranch, refSetId);
    const testSetDir = FilepathHelper.savedScreenshotSetDir(testProject, testBranch, testSetId);

    const differ: StoriesDiffer = new StoriesDifferImpl();
    const tolerance = 5;
    const result = await differ.computeDiff(refSetDir, testSetDir, tolerance);

    const map = new Map<string, StoryMetadataWithRenderStatus>();
    for (const x of refSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }
    for (const x of testSetMetadata.storyMetadataList) {
      map.set(x.id, x);
    }
    const storyMetadataList = Array.from(map.values());

    const id = uuidv4();
    const now = new Date();
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

  @CatchError<SaveComparisonResponse>(e => ({
    success: false,
    errMsg: e instanceof Error ? e.message : "Unknown error",
  }))
  @Log()
  public async save(name: string): Promise<SaveComparisonResponse> {
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
}
