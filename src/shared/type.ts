export interface Viewport {
  width: number;
  height: number;
}

export enum StoryState {
  WAITING = "WAITING",
  CAPTURING = "CAPTURING",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export interface StoryMetadata {
  id: string;
  componentId: string;
  title: string;
  kind: string;
  tags: string[];
  name: string;
  story: string;
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
}
