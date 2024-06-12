export interface GlobalMessage {
  type: "success" | "info" | "warn" | "error";
  message: string;
  title?: string;
}

export interface SavedScreenshotSetLocationIdentifier {
  project: string;
  branch: string;
  setId: string;
}

export interface SavedComparisonSetLocationIdentifier {
  project: string;
  setId: string;
}

export interface GetImgResponse {
  isExist: boolean;
  base64: string | null;
}

export interface GetSavedScreenshotImgRequest extends SavedScreenshotSetLocationIdentifier {
  id: string;
}

export interface GetSavedComparisonImgRequest extends SavedComparisonSetLocationIdentifier {
  id: string;
}

export type AppTheme = "light" | "dark";

export interface UserSetting {
  appTheme?: AppTheme;
  projectsInTab?: string[];
}

export interface Viewport {
  width: number;
  height: number;
}

export interface CreateNewScreenshotSetRequest {
  storybookUrl: string;
  viewport: Viewport;
  concurrency: number;
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
  defaultViewport?: string;
  skip?: boolean;
  fullPage?: boolean;
  delay?: number;
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
  workerName: string; // currently no used, for debugging purpose
  storyErr: boolean | null;
}

export interface SaveScreenshotRequest {
  project: string;
  branch: string;
  name: string;
}

export interface SavedScreenshotMetadata {
  id: string;
  createdAt: string;
  viewport: Viewport;
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
  skip: string[];
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

export interface CreateNewComparisonSetRequest {
  ref: SavedScreenshotSetLocationIdentifier;
  test: SavedScreenshotSetLocationIdentifier;
}

export interface CreateNewComparisonSetResponse {
  success: boolean;
  data: TempComparisonMetadata | null;
  storyMetadataList: StoryMetadataWithRenderStatus[] | null;
}

export interface SavedComparisonMetadata extends TempComparisonMetadata {
  name: string;
}

export interface SaveComparisonResponse {
  success: boolean;
  errMsg?: string;
}

export interface SavedScreenshotSetInfo {
  id: string;
  createdAt: string;
  project: string;
  branch: string;
  viewport: Viewport;
  name: string;
  fileSize: number;
  stories: number;
  errStories: number;
}

export type SavedComparisonSetInfo$Result = Record<keyof StoriesDiffResult, number>;

export interface SavedComparisonInfo {
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
  result: SavedComparisonSetInfo$Result;
}

export interface GetAllSavedScreenshotSetsResponse {
  screenshot: Record<string, Record<string, SavedScreenshotSetInfo>>;
}

export interface GetAllSavedSetsResponse {
  screenshot: Record<string, Record<string, SavedScreenshotSetInfo>>;
  comparison: SavedComparisonInfo[];
}

export type GetSavedScreenshotMetadataRequest = SavedScreenshotSetLocationIdentifier;

export type GetSavedScreenshotMetadataResponse = {
  data: SavedScreenshotMetadata | null;
};

export type GetSavedComparisonMetadataRequest = SavedComparisonSetLocationIdentifier;

export interface GetSavedComparisonMetadataResponse {
  data: {
    metadata: SavedComparisonMetadata;
    storyMetadataList: StoryMetadataWithRenderStatus[];
  } | null;
}

export type OpenScreenshotSetInExplorerRequest = SavedScreenshotSetLocationIdentifier;

export type OpenComparisonSetInExplorerRequest = SavedComparisonSetLocationIdentifier;

export type DeleteScreenshotSetRequest = SavedScreenshotSetLocationIdentifier;

export type DeleteComparisonSetRequest = SavedComparisonSetLocationIdentifier;

export interface DeleteScreenshotBranchRequest {
  project: string;
  branch: string;
}

export interface DeleteProjectRequest {
  project: string;
}
