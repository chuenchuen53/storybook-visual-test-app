import puppeteer from "puppeteer-core";
import fs from "fs-extra";
import { DockerContainer } from "../docker-helper/DockerContainer";
import { sleep } from "../utils";
import { ScreenshotManager } from "./ScreenshotManager";
import type { ExtendedBrowser } from "./ScreenshotManager";
import type {
  Crawler,
  GetStoriesMetadataResult,
  ScreenshotStoriesResult,
  StoryMetadata,
  SavedStoryMetadata,
  SavedMetadata,
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

  public async getStoriesMetadata(url: string): Promise<GetStoriesMetadataResult> {
    let container: DockerContainer | undefined = undefined;
    let browser: Browser | undefined = undefined;

    try {
      container = DockerContainer.getInstance("metadata");
      await container.start();
      const containerInfo = container.getContainerInfo()[0];
      // wait for chrome in container to start
      await sleep(2000);
      browser = await puppeteer.connect({
        browserURL: `http://localhost:${containerInfo.port}`,
      });
      const page = await browser.newPage();
      await page.goto(url + "/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story", {
        timeout: 30000,
        waitUntil: "networkidle0",
      });

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
      console.error(error);
      return { success: false, storyMetadataList: [] };
    } finally {
      try {
        if (browser) await browser.disconnect();
      } finally {
        if (container) await container.stop();
      }
    }
  }

  public async screenshotStories(
    url: string,
    storyMetadataList: StoryMetadata[],
    viewport: { width: number; height: number },
    parallel: number,
  ): Promise<ScreenshotStoriesResult> {
    let container: DockerContainer | undefined = undefined;
    const browsers: ExtendedBrowser[] = [];

    try {
      container = DockerContainer.getInstance("screenshot");

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
            dockerContainerId: containerInfo[i].id,
            connectionURL: `http://localhost:${containerInfo[i].port}`,
          };
        }),
      );

      const screenshotManager = new ScreenshotManager(browsers);
      const result = await screenshotManager.startScreenshot(
        storyMetadataList.map(x => ({ storyId: x.id, url, viewport })),
      );

      const metadataFilePath = "./temp/test-screenshot/metadata.json";
      const list: SavedStoryMetadata[] = storyMetadataList.map((x, i) => ({
        id: x.id,
        componentId: x.componentId,
        title: x.title,
        kind: x.kind,
        tags: x.tags,
        name: x.name,
        story: x.story,
        timeSpent: result[i].timeSpent,
        storyErr: result[i].storyErr,
      }));
      const saveMetaData: SavedMetadata = {
        createAt: new Date().toISOString(),
        storyMetadataList: list,
      };
      fs.writeFileSync(metadataFilePath, JSON.stringify(saveMetaData));

      return { success: true, viewport, storyScreenshotList: result };
    } catch (error) {
      console.error(error);
      return { success: false, viewport, storyScreenshotList: [] };
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
