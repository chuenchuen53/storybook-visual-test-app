import path from "path";
import puppeteer from "puppeteer-core";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { DockerContainer } from "../docker-helper/DockerContainer";
import { sleep } from "../utils";
import { screenshotDir, screenshotMetadataFilename } from "../Filepath";
import { logger } from "../logger";
import { ScreenshotManager } from "./ScreenshotManager";
import { getStorybookMetadata } from "./client-code";
import type { SavedMetadata, StoryMetadata, StoryState, Viewport } from "../../shared/type";
import type { Crawler } from "./Crawler";
import type { GetStoriesMetadataResult, ScreenshotStoriesResult } from "./type";
import type { NamedBrowser } from "./ScreenshotManager";
import type { Browser } from "puppeteer-core";

export class CrawlerImpl implements Crawler {
  private static instance: CrawlerImpl = new CrawlerImpl();

  private constructor() {
    // singleton
  }

  public static getInstance(): CrawlerImpl {
    return CrawlerImpl.instance;
  }

  /**
   * only work in storybook v8
   * */
  public async getStoriesMetadata(
    storybookUrl: string,
    onStartingBrowser: () => void,
    onComputingMetadata: () => void,
    onError: (err: unknown) => void,
  ): Promise<GetStoriesMetadataResult> {
    let container: DockerContainer | undefined = undefined;
    let browser: Browser | undefined = undefined;

    try {
      onStartingBrowser();

      logger.info("Starting metadata container");

      container = DockerContainer.getInstance("metadata");
      await container.start();
      const containerInfo = container.getContainerInfo()[0];

      logger.info("Successfully started metadata container");

      // wait for chrome in container to start
      await sleep(2000);

      logger.info("Connecting to storybook");

      browser = await puppeteer.connect({
        browserURL: `http://localhost:${containerInfo.port}`,
      });
      const page = await browser.newPage();
      await page.goto(storybookUrl + "/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story", {
        timeout: 30000,
        waitUntil: ["domcontentloaded", "networkidle0"],
      });

      logger.info("Successfully connected to storybook");
      logger.info("Computing metadata");

      onComputingMetadata();

      let trail = 0;
      const maxTrail = 5;
      const delayForTrail = 5000;

      let result: StoryMetadata[] = [];
      while (trail < maxTrail) {
        trail++;
        const resp = await getStorybookMetadata(page);
        if (resp.result) {
          result = resp.result;
          break;
        } else if (trail === maxTrail) {
          throw resp.error;
        } else {
          logger.error(resp.error);
          logger.error("Failed to get metadata, retrying");
          logger.info("Retrying");
          await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
          await sleep(delayForTrail);
        }
      }

      logger.info("Successfully computed metadata");

      return { success: true, storyMetadataList: result };
    } catch (error) {
      onError(error);
      return { success: false, storyMetadataList: null };
    } finally {
      try {
        if (browser) await browser.disconnect();
      } finally {
        if (container) await container.stop();
      }
    }
  }

  public async screenshotStories(
    storybookUrl: string,
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    parallel: number,
    onStartScreenshot: () => void,
    onStoryStateChange: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ): Promise<ScreenshotStoriesResult> {
    let container: DockerContainer | undefined = undefined;
    const browsers: NamedBrowser[] = [];

    try {
      logger.info("Starting screenshot containers");

      container = DockerContainer.getInstance("screenshot");

      for (let i = 0; i < parallel; i++) {
        await container.start();
      }

      const containerInfo = container.getContainerInfo();

      logger.info("Successfully started screenshot containers");

      // wait for chrome in container to start
      await sleep(2000);

      logger.info("Connecting to browser");

      onStartScreenshot();
      await Promise.all(
        Array.from({ length: parallel }, async (_, i) => {
          const browser = await puppeteer.connect({
            browserURL: `http://localhost:${containerInfo[i].port}`,
          });

          browsers[i] = {
            browser,
            name: `browser-${i}`,
          };
        }),
      );

      logger.info("Successfully connected to browser");

      logger.info("Starting screenshot");

      const screenshotManager = new ScreenshotManager(
        storybookUrl,
        browsers,
        storyMetadataList,
        viewport,
        onStoryStateChange,
      );
      const result = await screenshotManager.startScreenshot();

      const metadataFilePath = path.join(screenshotDir, screenshotMetadataFilename);
      const uuid = uuidv4();

      const saveMetaData: SavedMetadata = {
        uuid,
        createdAt: new Date().toISOString(),
        viewport,
        storyMetadataList: result,
      };
      fs.writeFileSync(metadataFilePath, JSON.stringify(saveMetaData));

      logger.info("Successful screenshot all stories");

      return { success: true, data: saveMetaData };
    } catch (error) {
      console.error(error);
      return { success: false, data: null };
    } finally {
      try {
        if (browsers.length > 0) {
          await Promise.all(browsers.map(browser => browser.browser.disconnect()));
        }
      } finally {
        if (container) await container.stop();
      }
    }
  }
}
