export interface GlobalMessage {
  type: "success" | "info" | "warn" | "error";
  message: string;
  title?: string;
}

export interface GetSavedRefTestImgRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
  id: string;
}

export interface GetSavedComparisonImgRequest {
  project: string;
  setId: string;
  id: string;
}

export interface GetImgResponse {
  isExist: boolean;
  base64: string | null;
}

export interface UserSetting {
  projectsInTab?: string[];
}

export interface Viewport {
  width: number;
  height: number;
}

export enum ScreenshotState {
  IDLE = "IDLE",
  CHECKING_SERVICE = "CHECKING_SERVICE",
  PREPARING_METADATA_BROWSER = "PREPARING_METADATA_BROWSER",
  COMPUTING_METADATA = "COMPUTING_METADATA",
  PREPARING_SCREENSHOT_BROWSER = "PREPARING_SCREENSHOT_BROWSER",
  CAPTURING_SCREENSHOT = "CAPTURING_SCREENSHOT",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export enum StoryState {
  WAITING = "WAITING",
  CAPTURING = "CAPTURING",
  FINISHED = "FINISHED",
}

export interface StoryMetadata {
  id: string;
  title: string;
  name: string;
  tags: string[];
}

export interface StoryMetadataWithRenderStatus extends StoryMetadata {
  storyErr: boolean;
}

export interface TempScreenshotMetadata {
  id: string;
  createdAt: string;
  viewport: Viewport;
  storyMetadataList: StoryMetadataWithRenderStatus[];
}

export interface StoryUpdateEventData {
  storyId: string;
  state: StoryState;
  browserName: string;
  storyErr: boolean | null;
}

export type SaveScreenshotType = "reference" | "test";

export interface SaveScreenshotRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  name: string;
}

export interface SavedScreenshotMetadata {
  id: string;
  createdAt: string;
  viewport: Viewport;
  type: SaveScreenshotType;
  project: string;
  branch: string;
  name: string;
  size: number;
  storyMetadataList: StoryMetadataWithRenderStatus[];
}

export interface SaveScreenshotResponse {
  success: boolean;
  errMsg?: string;
}

export interface StoriesDiffResult {
  same: string[];
  added: string[];
  removed: string[];
  diff: string[];
}

export interface TempComparisonMetadata {
  id: string;
  createdAt: string;
  project: string;
  refBranch: string;
  refSetId: string;
  refSetName: string;
  testBranch: string;
  testSetId: string;
  testSetName: string;
  viewport: Viewport;
  result: StoriesDiffResult;
}

export interface RefTestSetLocationIdentifier {
  project: string;
  branch: string;
  setId: string;
}

export interface ComparisonRequest {
  ref: RefTestSetLocationIdentifier;
  test: RefTestSetLocationIdentifier;
}

export interface ComparisonResponse {
  success: boolean;
  data: TempComparisonMetadata | null;
  storyMetadataList: StoryMetadataWithRenderStatus[] | null;
}

export interface SavedComparisonMetadata extends TempComparisonMetadata {
  name: string;
}

export interface GetComparisonSavedSetMetadataRequest {
  project: string;
  setId: string;
}

export interface GetComparisonSavedSetMetadataResponse {
  data: {
    metadata: SavedComparisonMetadata;
    storyMetadataList: StoryMetadataWithRenderStatus[];
  } | null;
}

export interface SetItem {
  id: string;
  createdAt: string;
  viewport: {
    width: number;
    height: number;
  };
  name: string;
}

export interface BranchScreenshotSet {
  branch: string;
  setList: SetItem[];
}

export interface GetAvailableSetResponse {
  ref: BranchScreenshotSet[];
  test: BranchScreenshotSet[];
}

export interface RefTestSavedInfo {
  id: string;
  createdAt: string;
  type: SaveScreenshotType;
  project: string;
  branch: string;
  viewport: Viewport;
  name: string;
  fileSize: number;
  stories: number;
  errStories: number;
}

export interface ComparisonSavedInfo$Result {
  same: number;
  added: number;
  removed: number;
  diff: number;
}

export interface ComparisonSavedInfo {
  id: string;
  createdAt: string;
  project: string;
  name: string;
  refBranch: string;
  refSetId: string;
  refSetName: string;
  testBranch: string;
  testSetId: string;
  testSetName: string;
  viewport: Viewport;
  result: ComparisonSavedInfo$Result;
}

export interface SavedSets {
  ref: Record<string, Record<string, RefTestSavedInfo>>;
  test: Record<string, Record<string, RefTestSavedInfo>>;
  comparison: ComparisonSavedInfo[];
}

export interface RetRefOrTestSavedSetMetadataRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
}

export interface StartScreenshotRequest {
  storybookUrl: string;
  viewport: Viewport;
  concurrency: number;
}

export interface OpenTestRefSetInExplorerRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
}

export interface OpenComparisonSetInExplorerRequest {
  project: string;
  setId: string;
}

export interface DeleteRefTestSetRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
}

export interface DeleteComparisonSetRequest {
  project: string;
  setId: string;
}

export interface DeleteRefTestBranchRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
}

export interface DeleteProjectRequest {
  project: string;
}
