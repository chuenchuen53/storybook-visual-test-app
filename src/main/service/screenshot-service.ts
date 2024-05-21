import fs from "fs-extra";
import { GlobalChannel, ScreenshotChannel } from "../../MainWindowHelper";
import { CrawlerImpl } from "../crawler/CrawlerImpl";
import { isDockerAvailable } from "../docker-helper/is-docker-available";
import { checkDockerImage, CHROME_IMAGE, pullDockerImage } from "../docker-helper/docker-image";
import { screenshotDir } from "../Filepath";

import { ScreenshotState } from "../../shared/type";
import { logger } from "../logger";
import type { Crawler } from "../crawler/Crawler";

function sendFailStatusAndErrMsg(errorMsg: string) {
  GlobalChannel.sendGlobalMessage("error", errorMsg);
  ScreenshotChannel.updateStatus(ScreenshotState.FAILED);
}

export async function screenshotService(url: string) {
  logger.info("Start new screenshot");

  try {
    if (!isDockerAvailable()) {
      sendFailStatusAndErrMsg("Docker is not available");
      return;
    }
  } catch (e) {
    logger.error(e);
    sendFailStatusAndErrMsg("Fail to check docker availability");
    return;
  }

  try {
    const isDockerImageAvailable = await checkDockerImage();
    if (!isDockerImageAvailable) {
      await pullDockerImage();
    }
  } catch (e) {
    logger.error(e);
    sendFailStatusAndErrMsg("Failed to pull docker image: " + CHROME_IMAGE);
    return;
  }

  try {
    await fs.remove(screenshotDir);
    await fs.ensureDir(screenshotDir);

    const crawler: Crawler = CrawlerImpl.getInstance();
    const metadataResult = await crawler.getStoriesMetadata(
      url,
      () => ScreenshotChannel.updateStatus(ScreenshotState.PREPARING_METADATA_BROWSER),
      () => ScreenshotChannel.updateStatus(ScreenshotState.COMPUTING_METADATA),
      (err: Error) => logger.error(err),
    );

    if (metadataResult.success === false || metadataResult.storyMetadataList === null) {
      sendFailStatusAndErrMsg("Failed to get stories metadata.\n See log for more details.");
      return;
    }

    ScreenshotChannel.newMetadata(metadataResult.storyMetadataList);
    ScreenshotChannel.updateStatus(ScreenshotState.PREPARING_SCREENSHOT_BROWSER);
    const result = await crawler.screenshotStories(
      url,
      metadataResult.storyMetadataList,
      {
        width: 1920,
        height: 1080,
      },
      8,
      () => ScreenshotChannel.updateStatus(ScreenshotState.CAPTURING_SCREENSHOT),
      (storyId, state, browserName, storyErr) =>
        ScreenshotChannel.updateStoryState(storyId, state, browserName, storyErr),
    );

    if (result.success === false) {
      sendFailStatusAndErrMsg("Failed to take screenshot");
      return;
    }
    ScreenshotChannel.updateStatus(ScreenshotState.FINISHED);

    logger.info("End of screenshot");
  } catch (e) {
    logger.error(e);
    sendFailStatusAndErrMsg("Failed to take screenshot");
  }
}
