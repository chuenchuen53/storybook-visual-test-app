import { BrowserWindow } from "electron";
import type { ScreenshotState, StoryMetadata, StoryState } from "./shared/type";

export class GlobalChannel {
  public static sendGlobalMessage(type: "success" | "info" | "warn" | "error", message: string) {
    MainWindowHelper.send("global:message", { type, message });
  }
}

export class ScreenshotChannel {
  public static updateStatus(status: ScreenshotState) {
    MainWindowHelper.send("screenshot:updateStatus", status);
  }

  public static newMetadata(storyMetadataList: StoryMetadata[]) {
    MainWindowHelper.send("screenshot:newMetadata", storyMetadataList);
  }

  public static updateStoryState(
    storyId: string,
    state: StoryState,
    browserName: string | null,
    storyErr: boolean | null,
  ) {
    MainWindowHelper.send("screenshot:updateStoryState", storyId, state, browserName, storyErr);
  }
}

export class MainWindowHelper extends BrowserWindow {
  private static instance: BrowserWindow | null = null;

  public static registerMainWindow(x: BrowserWindow) {
    if (MainWindowHelper.instance !== null) {
      // todo
      throw new Error("MainWindow has already been registered");
    }
    MainWindowHelper.instance = x;
  }

  public static send(channel: string, ...args: any[]) {
    if (MainWindowHelper.instance === null) {
      console.log("[WARN]: send is called before MainWindow registered");
    }
    MainWindowHelper.instance.webContents.send(channel, ...args);
  }
}
