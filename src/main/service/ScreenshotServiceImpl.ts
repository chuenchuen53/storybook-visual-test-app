import os from "os";
import path from "path";
import fs from "fs-extra";
import { GlobalChannel, ScreenshotChannel } from "../../MainWindowHelper";
import { CrawlerImpl } from "../crawler/CrawlerImpl";
import { isDockerAvailable } from "../docker-helper/is-docker-available";
import { checkDockerImage, CHROME_IMAGE, pullDockerImage } from "../docker-helper/docker-image";
import {
  savedInfoFilename,
  savedReferenceDir,
  savedTestDir,
  screenshotDir,
  screenshotMetadataFilename,
} from "../Filepath";
import { ScreenshotState } from "../../shared/type";
import { logger } from "../logger";
import type { SavedScreenshotResponse, SaveScreenshotType } from "../../interface";
import type { ScreenshotService } from "./ScreenshotService";
import type { Crawler } from "../crawler/Crawler";

export class ScreenshotServiceImpl implements ScreenshotService {
  private static readonly instance: ScreenshotService = new ScreenshotServiceImpl();

  private constructor() {
    // singleton
  }

  public static getInstance(): ScreenshotService {
    return ScreenshotServiceImpl.instance;
  }

  public getLocalIPAddress(): string | undefined {
    const interfaces = os.networkInterfaces();
    const ips = Object.keys(interfaces)
      .map(
        key =>
          interfaces[key]
            ?.filter(({ family, internal }) => family === "IPv4" && !internal)
            .map(({ address }) => address) ?? [],
      )
      .reduce((acc, current) => acc.concat(current), []);
    return ips[0];
  }

  public async newScreenshotSet(url: string): Promise<void> {
    try {
      logger.info("Start new screenshot");

      if (!isDockerAvailable()) {
        this.sendFailStatusAndErrMsg("Docker is not available");
        return;
      }
    } catch (e) {
      logger.error(e);
      this.sendFailStatusAndErrMsg("Fail to check docker availability");
      return;
    }

    try {
      const isDockerImageAvailable = await checkDockerImage();
      if (!isDockerImageAvailable) {
        await pullDockerImage();
      }
    } catch (e) {
      logger.error(e);
      this.sendFailStatusAndErrMsg("Failed to pull docker image: " + CHROME_IMAGE);
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
        this.sendFailStatusAndErrMsg("Failed to get stories metadata.\n See log for more details.");
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
        this.sendFailStatusAndErrMsg("Failed to take screenshot");
        return;
      }
      ScreenshotChannel.updateStatus(ScreenshotState.FINISHED);

      logger.info("End of screenshot");
    } catch (e) {
      logger.error(e);
      this.sendFailStatusAndErrMsg("Failed to take screenshot");
    }
  }

  public async saveScreenshot(
    project: string,
    branch: string,
    type: SaveScreenshotType,
  ): Promise<SavedScreenshotResponse> {
    try {
      const srcDir = screenshotDir;

      const metadata = await fs.readJSON(path.join(srcDir, screenshotMetadataFilename));
      const uuid = metadata.uuid;

      const typeDir = type === "reference" ? savedReferenceDir : savedTestDir;
      const destDir = path.join(typeDir, project, branch, uuid);
      await fs.ensureDir(destDir);
      await fs.copy(srcDir, destDir, { overwrite: true });
      const savedInfo = {
        uuid,
        type,
        project,
        branch,
      };
      const savedInfoPath = path.join(destDir, savedInfoFilename);
      await fs.writeJson(savedInfoPath, savedInfo);
      return { success: true };
    } catch (e) {
      logger.error(e);
      return { success: false, errMsg: e.message };
    }
  }

  private sendFailStatusAndErrMsg(errorMsg: string) {
    GlobalChannel.sendGlobalMessage("error", errorMsg);
    ScreenshotChannel.updateStatus(ScreenshotState.FAILED);
  }
}
