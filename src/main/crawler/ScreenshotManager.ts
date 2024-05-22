import path from "path";
import { sleep } from "../utils";
import { screenshotDir } from "../Filepath";
import { StoryState } from "../../shared/type";
import { logger } from "../logger";
import { GlobalChannel } from "../message-emitter/GlobalChannel";
import type { Viewport, StoryMetadata } from "../../shared/type";
import type { StoryScreenshotMetadata } from "./type";
import type { Browser, ElementHandle } from "puppeteer-core";

export interface NamedBrowser {
  browser: Browser;
  name: string;
}

export type OnStoryStateChange = (
  storyId: string,
  state: StoryState,
  browserName: string,
  storyErr: boolean | null,
) => void;

export class ScreenshotManager {
  private readonly result: StoryScreenshotMetadata[] = [];

  constructor(
    private readonly storybookUrl: string,
    private readonly browsers: NamedBrowser[],
    private readonly storyMetadataList: StoryMetadata[],
    private readonly viewport: Viewport,
    private readonly onStoryStateChange: OnStoryStateChange,
  ) {}

  async startScreenshot(): Promise<StoryScreenshotMetadata[]> {
    let nextJobIndex = this.browsers.length;

    await Promise.all(
      this.browsers.map((browser, index) => {
        return new Promise<void>((resolve, reject) => {
          (async () => {
            try {
              if (!(index + 1 > this.storyMetadataList.length)) {
                await this.screenshot(browser, index);
                while (nextJobIndex < this.storyMetadataList.length) {
                  const jobIndex = nextJobIndex++;
                  await this.screenshot(browser, jobIndex);
                }
              }
              resolve();
            } catch (error) {
              reject(error);
            }
          })();
        });
      }),
    );

    return this.result;
  }

  private storyUrl(url: string, storyId: string) {
    return `${url}/iframe.html?args=&id=${storyId}`;
  }

  private async screenshot(browser: NamedBrowser, jobIndex: number) {
    const story = this.storyMetadataList[jobIndex];

    this.onStoryStateChange(story.id, StoryState.CAPTURING, browser.name, null);

    const page = await browser.browser.newPage();
    await page.setViewport(this.viewport);
    await page.goto(this.storyUrl(this.storybookUrl, story.id), {
      timeout: 30000,
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    const storyErr = await page.evaluate(() => {
      const errorStack = document.querySelector("#error-stack");
      return errorStack && errorStack.textContent.trim().length > 0;
    });

    const filepath = path.join(screenshotDir, `${story.id}.png`);

    const rootElementSelector = "#storybook-root";
    // Wait for the root element to be available
    await page.waitForSelector(rootElementSelector);
    const rootElement = await page.$(rootElementSelector);

    let captureElement: ElementHandle | null = null;

    if (!storyErr && rootElement) {
      // Selects direct children of the root element
      const children = await rootElement.$$(":scope > *");
      if (children.length === 1) {
        // If there is exactly one child, screenshot that child
        captureElement = children[0];
      } else {
        // If there are multiple children, screenshot the root element
        captureElement = rootElement;
      }
    }

    if (captureElement) {
      let trialTimes = 0;
      const delayInterval = 500;
      const maxTrials = 10;

      while (trialTimes < maxTrials) {
        trialTimes++;
        const isVisible = await page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0;
        }, captureElement);

        if (isVisible) break;

        await sleep(delayInterval);
      }

      if (trialTimes === maxTrials) {
        // todo: this case are mostly happen when the story have element that is absolute or fixed, like modal, tooltip, etc
        logger.warn("Cannot detect size of story " + story.id);
        GlobalChannel.sendGlobalMessage(
          "warn",
          `Cannot detect size of story ${story.id}\nscreenshotting the whole page instead`,
        );
        await page.screenshot({ path: filepath });
      } else {
        await captureElement.screenshot({ path: filepath });
      }
    } else {
      await page.screenshot({ path: filepath });
    }

    await page.close();
    this.result[jobIndex] = {
      id: story.id,
      componentId: story.componentId,
      kind: story.kind,
      name: story.name,
      story: story.story,
      tags: story.tags,
      title: story.title,
      storyErr,
    };

    this.onStoryStateChange(story.id, StoryState.FINISHED, browser.name, storyErr);
  }
}
