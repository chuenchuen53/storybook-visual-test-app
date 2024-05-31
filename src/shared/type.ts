export interface Viewport {
  width: number;
  height: number;
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

export interface GlobalMessage {
  type: "success" | "info" | "warn" | "error";
  message: string;
  title?: string;
}

export interface SavedScreenshotResponse {
  success: boolean;
  errMsg?: string;
}

export type SaveScreenshotType = "reference" | "test";

export interface StoriesDiffResult {
  same: string[];
  added: string[];
  removed: string[];
  diff: string[];
}

export interface ComparisonResponse$Data {
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

export interface SavedComparisonMetadata extends ComparisonResponse$Data {
  name: string;
}

export interface GetComparisonSavedSetMetadataRequest {
  project: string;
  setId: string;
}

export interface GetComparisonSavedSetMetadataResponse {
  data: {
    metadata: SavedComparisonMetadata;
    storyMetadataList: StoryScreenshotMetadata[];
  } | null;
}

export interface SetData {
  project: string;
  branch: string;
  setId: string;
}

export interface ComparisonRequest {
  ref: SetData;
  test: SetData;
}

export interface ComparisonResponse {
  success: boolean;
  data: ComparisonResponse$Data | null;
  storyMetadataList: StoryScreenshotMetadata[] | null;
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

export interface GetImgResponse {
  isExist: boolean;
  base64: string | null;
}

export interface UserSetting {
  projectsInTab?: string[];
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

export interface StoryScreenshotMetadata extends StoryMetadata {
  storyErr: boolean;
}

export interface TempScreenshotMetadata {
  id: string;
  createdAt: string;
  viewport: Viewport;
  storyMetadataList: StoryScreenshotMetadata[];
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
  storyMetadataList: StoryScreenshotMetadata[];
}

export interface RetRefOrTestSavedSetMetadataRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
}

export interface GetSavedImgRequest {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  setId: string;
  id: string;
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
