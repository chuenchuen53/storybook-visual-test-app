import type { StoriesDiffResult } from "./service/stories-differ/StoriesDiffer";
import type { StoryState, StoryMetadata } from "./service/crawler/type";

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

export interface UpdateStatus {
  type: "status";
  status: ScreenshotState;
}

export interface UpdateError {
  type: "error";
  errorMsg: string;
}

export interface NewMetadata {
  type: "new-metadata";
  storyMetadataList: StoryMetadata[];
}

export interface UpdateStoryState {
  type: "update-story-state";
  storyId: string;
  state: StoryState;
  storyErr: boolean | null;
  browserName: string;
}

export type SendScreenshotInfoParams = UpdateStatus | UpdateError | NewMetadata | UpdateStoryState;
