import { MainWindow } from "../../MainWindow";
import type { ScreenshotState, StoryMetadata, StoryState } from "../../shared/type";

export class ScreenshotChannel {
  public static updateStatus(status: ScreenshotState) {
    MainWindow.send("screenshot:updateStatus", status);
  }

  public static newMetadata(storyMetadataList: StoryMetadata[]) {
    MainWindow.send("screenshot:newMetadata", storyMetadataList);
  }

  public static updateStoryState(
    storyId: string,
    state: StoryState,
    browserName: string | null,
    storyErr: boolean | null,
  ) {
    MainWindow.send("screenshot:updateStoryState", storyId, state, browserName, storyErr);
  }
}
