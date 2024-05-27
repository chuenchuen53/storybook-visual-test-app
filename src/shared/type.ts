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

export interface CompareResponse$Data {
  uuid: string;
  createAt: string;
  project: string;
  refBranch: string;
  testBranch: string;
  refId: string;
  testSetId: string;
  result: StoriesDiffResult;
}

export interface CompareResponse {
  success: boolean;
  data: CompareResponse$Data | null;
}

export interface BranchScreenshotSet {
  branch: string;
  setList: { uuid: string; createAt: string; viewport: { width: number; height: number } }[];
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
  fileSize: string;
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
  testBranch: string;
  refSetId: string;
  testSetId: string;
  refSetName: string;
  testSetName: string;
  viewport: Viewport;
  result: ComparisonSavedInfo$Result;
}

export interface SavedSets {
  ref: RefTestSavedInfo[];
  test: RefTestSavedInfo[];
  comparison: ComparisonSavedInfo[];
}

export interface StoryScreenshotMetadata extends StoryMetadata {
  storyErr: boolean;
}

export interface SavedMetadata {
  uuid: string;
  createAt: string;
  viewport: Viewport;
  storyMetadataList: StoryScreenshotMetadata[];
}
