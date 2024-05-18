import { MainWindowHelper, ScreenshotState } from "../MainWindowHelper";
import { CrawlerImpl } from "./crawler/CrawlerImpl";
import { isDockerAvailable } from "./docker-helper/is-docker-available";
import { checkDockerImage, CHROME_IMAGE, pullDockerImage } from "./docker-helper/docker-image";
import type { Crawler } from "./crawler/type";

function sendFailStatusAndErrMsg(errorMsg: string) {
  MainWindowHelper.sendScreenshotInfo({ type: "error", errorMsg });
  MainWindowHelper.sendScreenshotInfo({ type: "status", status: ScreenshotState.FAILED });
}

export async function screenshotService(url: string) {
  try {
    if (!isDockerAvailable()) {
      sendFailStatusAndErrMsg("Docker is not available");
      return;
    }
  } catch (e) {
    sendFailStatusAndErrMsg("Fail to check docker availability");
    return;
  }

  try {
    const isDockerImageAvailable = await checkDockerImage();
    if (!isDockerImageAvailable) {
      await pullDockerImage();
    }
  } catch (e) {
    sendFailStatusAndErrMsg("Failed to pull docker image: " + CHROME_IMAGE);
    return;
  }

  try {
    const crawler: Crawler = CrawlerImpl.getInstance();
    const metadataResult = await crawler.getStoriesMetadata(
      url,
      () =>
        MainWindowHelper.sendScreenshotInfo({ type: "status", status: ScreenshotState.PREPARING_SCREENSHOT_BROWSER }),
      () => MainWindowHelper.sendScreenshotInfo({ type: "status", status: ScreenshotState.COMPUTING_METADATA }),
      (x: string) =>
        MainWindowHelper.sendScreenshotInfo({ type: "error", errorMsg: "Failed to get stories metadata.\n" + x }),
    );
    MainWindowHelper.sendScreenshotInfo({ type: "new-metadata", storyMetadataList: metadataResult.storyMetadataList });

    if (metadataResult.success === true && metadataResult.storyMetadataList !== null) {
      const result = await crawler.screenshotStories(
        url,
        metadataResult.storyMetadataList,
        {
          width: 1920,
          height: 1080,
        },
        8,
        (storyId, state, browserName) =>
          MainWindowHelper.sendScreenshotInfo({ type: "update-story-state", storyId, state, browserName }),
      );
      if (result.success === false) {
        sendFailStatusAndErrMsg("Failed to take screenshot");
        return;
      }
      MainWindowHelper.sendScreenshotInfo({ type: "status", status: ScreenshotState.FINISHED });
    } else {
      sendFailStatusAndErrMsg("Failed to get stories metadata");
    }
  } catch (e) {
    sendFailStatusAndErrMsg("Failed to take screenshot");
  }
}
