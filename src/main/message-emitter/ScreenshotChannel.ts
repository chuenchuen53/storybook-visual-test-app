import { MainWindow } from "../../MainWindow";
import { ScreenshotChannelKey } from "../../shared/ScreenshotApi";
import type { FirstParamTypeForListener } from "../../shared/ipc-type-helper";
import type { ScreenshotApi } from "../../shared/ScreenshotApi";

export class ScreenshotChannel {
  public static updateStatus(status: FirstParamTypeForListener<ScreenshotApi, "onUpdateStatus">) {
    MainWindow.send(ScreenshotChannelKey.listen.onUpdateStatus, status);
  }

  public static newMetadata(storyMetadataList: FirstParamTypeForListener<ScreenshotApi, "onNewMetadata">) {
    MainWindow.send(ScreenshotChannelKey.listen.onNewMetadata, storyMetadataList);
  }

  public static updateStoryState(data: FirstParamTypeForListener<ScreenshotApi, "onUpdateStoryState">) {
    MainWindow.send(ScreenshotChannelKey.listen.onUpdateStoryState, data);
  }
}
