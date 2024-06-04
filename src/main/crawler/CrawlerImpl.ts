import puppeteer from "puppeteer-core";
import { DockerContainer } from "../docker-helper/DockerContainer";
import { sleep } from "../utils";
import { logger } from "../logger";
import { Log } from "../decorator/Log";
import { ScreenshotManager } from "./ScreenshotManager";
import { getStorybookMetadata } from "./client-code";
import type { ScreenshotWorker } from "./ScreenshotManager";
import type { Browser, Page } from "puppeteer-core";
import type { StoryMetadata, StoryState, Viewport } from "../../shared/type";
import type { Crawler } from "./Crawler";
import type { GetStoriesMetadataResult, ScreenshotStoriesResult } from "./type";

export class CrawlerImpl implements Crawler {
  private static instance: Crawler = new CrawlerImpl();
  private static readonly BROWSER_LAUNCH_DELAY = 2000;

  public static getInstance(): Crawler {
    return CrawlerImpl.instance;
  }

  private constructor() {}

  /**
   * only work in storybook v8
   * */
  @Log("CrawlerImpl.getStoriesMetadata")
  public async getStoriesMetadata(
    storybookUrl: string,
    onStartComputeMetadata: () => void,
  ): Promise<GetStoriesMetadataResult> {
    let container: DockerContainer | undefined = undefined;
    let browser: Browser | undefined = undefined;

    try {
      container = await this.startMetadataBrowser();
      const containerInfo = container.getContainerInfo();
      if (!containerInfo) throw new Error("Container not available. Logic error in code");

      // wait for chrome in container to start
      await sleep(CrawlerImpl.BROWSER_LAUNCH_DELAY);

      const storybookConnection = await this.connectToStorybook(`http://localhost:${containerInfo.port}`, storybookUrl);
      browser = storybookConnection.browser;
      const page = storybookConnection.page;

      onStartComputeMetadata();

      const storyMetadataList = await this.computeMetadata(page);

      return { storyMetadataList };
    } finally {
      try {
        if (browser) await browser.disconnect();
      } finally {
        if (container) await container.stop();
      }
    }
  }

  @Log("CrawlerImpl.screenshotStories")
  public async screenshotStories(
    storybookUrl: string,
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    concurrency: number,
    onStartScreenshot: () => void,
    onStoryStateChange: (storyId: string, state: StoryState, workerName: string, storyErr: boolean | null) => void,
  ): Promise<ScreenshotStoriesResult> {
    let container: DockerContainer | undefined = undefined;
    const workers: ScreenshotWorker[] = [];

    try {
      container = await this.startScreenshotBrowser();

      // wait for chrome in container to start
      await sleep(CrawlerImpl.BROWSER_LAUNCH_DELAY);

      await this.connectToBrowser(concurrency, container, workers);

      onStartScreenshot();
      const storyScreenshotMetadataList = await this.screenshot(
        storybookUrl,
        workers,
        storyMetadataList,
        viewport,
        onStoryStateChange,
      );

      return { storyScreenshotMetadataList };
    } finally {
      try {
        if (workers.length > 0) {
          await Promise.all(workers.map(x => x.browser.disconnect()));
        }
      } finally {
        if (container) await container.stop();
      }
    }
  }

  @Log()
  private async startMetadataBrowser(): Promise<DockerContainer> {
    const container = DockerContainer.getInstance("metadata");
    await container.start();
    return container;
  }

  @Log()
  private async connectToStorybook(
    dockerBrowserUrl: string,
    storybookUrl: string,
  ): Promise<{ browser: Browser; page: Page }> {
    const browser = await puppeteer.connect({
      browserURL: dockerBrowserUrl,
    });
    const page = await browser.newPage();
    await page.goto(storybookUrl + "/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story", {
      timeout: 30000,
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    return { browser, page };
  }

  @Log()
  private async computeMetadata(page: Page): Promise<StoryMetadata[]> {
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
      } else if (trail >= maxTrail) {
        throw resp.error;
      } else {
        logger.error(resp.error);
        logger.info("Fail to get metadata, retrying");
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await sleep(delayForTrail);
      }
    }

    return result;
  }

  @Log()
  private async startScreenshotBrowser(): Promise<DockerContainer> {
    const container = DockerContainer.getInstance("screenshot");
    await container.start();
    return container;
  }

  @Log()
  private async connectToBrowser(concurrency: number, container: DockerContainer, browsers: ScreenshotWorker[]) {
    const containerInfo = container.getContainerInfo();
    if (!containerInfo) throw new Error("Container not available. Logic error in code");
    const browser = await puppeteer.connect({
      browserURL: `http://localhost:${containerInfo.port}`,
    });
    for (let i = 0; i < concurrency; i++) {
      browsers.push({
        browser,
        name: `worker-${i}`,
      });
    }
  }

  @Log()
  private async screenshot(
    storybookUrl: string,
    workers: ScreenshotWorker[],
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    onStoryStateChange: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ) {
    const screenshotManager = new ScreenshotManager(
      storybookUrl,
      workers,
      storyMetadataList,
      viewport,
      onStoryStateChange,
    );
    return await screenshotManager.startScreenshot();
  }
}
