import path from "path";
import puppeteer from "puppeteer-core";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { DockerContainer } from "../docker-helper/DockerContainer";
import { sleep } from "../utils";
import { screenshotDir, screenshotMetadataFilename } from "../Filepath";
import { ScreenshotManager } from "./ScreenshotManager";
import type { StoryState } from "../../MainWindowHelper";
import type { NamedBrowser } from "./ScreenshotManager";
import type {
  Crawler,
  GetStoriesMetadataResult,
  SavedMetadata,
  ScreenshotStoriesResult,
  StoryMetadata,
  Viewport,
} from "./type";
import type { Browser } from "puppeteer-core";

export class CrawlerImpl implements Crawler {
  private static instance: CrawlerImpl = new CrawlerImpl();

  private constructor() {
    // do nothing
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
    onError: (errorMsg: string) => void,
  ): Promise<GetStoriesMetadataResult> {
    let container: DockerContainer | undefined = undefined;
    let browser: Browser | undefined = undefined;

    try {
      onStartingBrowser();

      container = DockerContainer.getInstance("metadata");
      await container.start();
      const containerInfo = container.getContainerInfo()[0];
      // wait for chrome in container to start
      await sleep(2000);
      browser = await puppeteer.connect({
        browserURL: `http://localhost:${containerInfo.port}`,
      });
      const page = await browser.newPage();
      await page.goto(storybookUrl + "/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story", {
        timeout: 30000,
        waitUntil: "networkidle0",
      });

      onComputingMetadata();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.waitForFunction(() => (window as any).__STORYBOOK_PREVIEW__?.storyStoreValue, {
        timeout: 30000,
      });
      await page.evaluate(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = (window as any).__STORYBOOK_PREVIEW__;
        return await api.storyStoreValue?.cacheAllCSFFiles();
      });
      const result: StoryMetadata[] = await page.evaluate(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const api = (window as any).__STORYBOOK_PREVIEW__;
        const rawData = await api.storyStoreValue.extract();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Object.values(rawData).map((x: any) => ({
          id: x.id,
          componentId: x.componentId,
          title: x.title,
          kind: x.kind,
          tags: x.tags,
          name: x.name,
          story: x.story,
        }));
      });

      return { success: true, storyMetadataList: result };
    } catch (error) {
      onError(error.message);
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
    onStoryStateChange: (storyId: string, state: StoryState, browserName: string) => void,
  ): Promise<ScreenshotStoriesResult> {
    let container: DockerContainer | undefined = undefined;
    const browsers: NamedBrowser[] = [];

    try {
      container = DockerContainer.getInstance("screenshot");

      // todo: test if ok to parallel start
      for (let i = 0; i < parallel; i++) {
        await container.start();
      }

      const containerInfo = container.getContainerInfo();
      // wait for chrome in container to start
      await sleep(2000);

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
        createAt: new Date().toISOString(),
        viewport,
        storyMetadataList: result,
      };
      fs.writeFileSync(metadataFilePath, JSON.stringify(saveMetaData));

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
