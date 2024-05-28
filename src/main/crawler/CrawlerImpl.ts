import puppeteer from "puppeteer-core";
import { DockerContainer } from "../docker-helper/DockerContainer";
import { sleep } from "../utils";
import { logger } from "../logger";
import { Log } from "../decorator/Log";
import { ScreenshotManager } from "./ScreenshotManager";
import { getStorybookMetadata } from "./client-code";
import type { NamedBrowser } from "./ScreenshotManager";
import type { Browser, Page } from "puppeteer-core";
import type { StoryMetadata, StoryState, Viewport } from "../../shared/type";
import type { Crawler } from "./Crawler";
import type { GetStoriesMetadataResult, ScreenshotStoriesResult } from "./type";

export class CrawlerImpl implements Crawler {
  private static instance: Crawler = new CrawlerImpl();

  public static getInstance(): Crawler {
    return CrawlerImpl.instance;
  }

  private constructor() {
    // singleton
  }

  /**
   * only work in storybook v8
   * */
  public async getStoriesMetadata(
    storybookUrl: string,
    onComputingMetadata: () => void,
  ): Promise<GetStoriesMetadataResult> {
    let container: DockerContainer | undefined = undefined;
    let browser: Browser | undefined = undefined;

    try {
      container = await this.startMetadataBrowser();
      const containerInfo = container.getContainerInfo()[0];

      // wait for chrome in container to start
      await sleep(2000);

      const storybookConnection = await this.connectToStorybook(`http://localhost:${containerInfo.port}`, storybookUrl);
      browser = storybookConnection.browser;
      const page = storybookConnection.page;

      onComputingMetadata();

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
      container = await this.startScreenshotBrowser(parallel);

      // wait for chrome in container to start
      await sleep(2000);

      onStartScreenshot();

      await this.connectToBrowser(parallel, container, browsers);
      const storyScreenshotMetadataList = await this.screenshot(
        storybookUrl,
        browsers,
        storyMetadataList,
        viewport,
        onStoryStateChange,
      );

      return { storyScreenshotMetadataList };
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
      } else if (trail === maxTrail) {
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
  private async startScreenshotBrowser(parallel: number): Promise<DockerContainer> {
    const container = DockerContainer.getInstance("screenshot");

    for (let i = 0; i < parallel; i++) {
      await container.start();
    }

    return container;
  }

  @Log()
  private async connectToBrowser(parallel: number, container: DockerContainer, browsers: NamedBrowser[]) {
    const containerInfo = container.getContainerInfo();
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
  }

  @Log()
  private async screenshot(
    storybookUrl: string,
    browsers: NamedBrowser[],
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    onStoryStateChange: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ) {
    const screenshotManager = new ScreenshotManager(
      storybookUrl,
      browsers,
      storyMetadataList,
      viewport,
      onStoryStateChange,
    );
    return await screenshotManager.startScreenshot();
  }
}
