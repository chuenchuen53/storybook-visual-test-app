import { BrowserWindow } from "electron";
import type { StoryMetadata } from "./service/crawler/type";

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
  browserName: string;
}

export type SendScreenshotInfoParams = UpdateStatus | UpdateError | NewMetadata | UpdateStoryState;

export class MainWindowHelper extends BrowserWindow {
  private static instance: BrowserWindow | null = null;

  public static registerMainWindow(x: BrowserWindow) {
    if (MainWindowHelper.instance !== null) {
      // todo
      throw new Error("MainWindow has already been registered");
    }
    MainWindowHelper.instance = x;
  }

  public static sendScreenshotInfo(params: SendScreenshotInfoParams) {
    MainWindowHelper.send("screenshot:info", params);
  }

  private static send(channel: string, ...args: any[]) {
    if (MainWindowHelper.instance === null) {
      console.log("[WARN]: send is called before MainWindow registered");
    }
    MainWindowHelper.instance.webContents.send(channel, ...args);
  }
}
