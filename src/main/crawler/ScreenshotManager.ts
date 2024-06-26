import { sleep } from "../utils";
import { FilepathHelper } from "../Filepath";
import { StoryState } from "../../shared/type";
import { logger } from "../logger";
import { GlobalChannel } from "../message-emitter/GlobalChannel";
import { viewportMap } from "../viewport-map";
import type { StoryMetadata, StoryMetadataWithRenderStatus, Viewport } from "../../shared/type";
import type { Browser, ElementHandle } from "puppeteer-core";

export interface ScreenshotWorker {
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
  private readonly result: StoryMetadataWithRenderStatus[] = [];

  public constructor(
    private readonly storybookUrl: string,
    private readonly workers: ScreenshotWorker[],
    private readonly storyMetadataList: StoryMetadata[],
    private readonly viewport: Viewport,
    private readonly onStoryStateChange: OnStoryStateChange,
  ) {}

  public async startScreenshot(): Promise<StoryMetadataWithRenderStatus[]> {
    let nextJobIndex = this.workers.length;

    await Promise.all(
      this.workers.map((worker, index) => {
        return new Promise<void>((resolve, reject) => {
          (async () => {
            try {
              // in case of num of workers is more than the num of stories, the worker not need to do anything
              if (!(index + 1 > this.storyMetadataList.length)) {
                await this.captureScreenshot(worker, index);
                while (nextJobIndex < this.storyMetadataList.length) {
                  const jobIndex = nextJobIndex++;
                  await this.captureScreenshot(worker, jobIndex);
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

  private storyUrl(storybookUrl: string, storyId: string) {
    return `${storybookUrl}/iframe.html?args=&id=${storyId}`;
  }

  private async captureScreenshot(worker: ScreenshotWorker, jobIndex: number) {
    const story = this.storyMetadataList[jobIndex];

    this.onStoryStateChange(story.id, StoryState.CAPTURING, worker.name, null);
    const defaultViewport = story.defaultViewport ? viewportMap[story.defaultViewport] : undefined;
    const viewport = defaultViewport ?? this.viewport;
    const page = await worker.browser.newPage();
    await page.setViewport(viewport);
    await page.goto(this.storyUrl(this.storybookUrl, story.id), {
      timeout: 30000,
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    if (story.disableCssAnimation) {
      await page.evaluate(() => {
        const css = `
*,
*::before,
*::after {
  -webkit-transition: none !important;
  transition: none !important;
  -webkit-animation: none !important;
  animation: none !important;
  will-change: auto !important;
}`;
        const style = document.createElement("style");
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
      });
    }

    if (story.selectorsForHiddenElements && story.selectorsForHiddenElements.length > 0) {
      await page.evaluate(selectors => {
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            (element as HTMLElement).style.visibility = "hidden";
          });
        });
      }, story.selectorsForHiddenElements);
    }

    const storyErr = await page.evaluate(() => {
      const errorStack = document.querySelector("#error-stack");
      return Boolean(errorStack?.textContent && errorStack.textContent.trim().length > 0);
    });

    const filepath = FilepathHelper.tempScreenshotImgPath(story.id + ".png");

    const rootElementSelector = "#storybook-root";
    // Wait for the root element to be available
    await page.waitForSelector(rootElementSelector);
    const rootElement = await page.$(rootElementSelector);

    let captureElement: ElementHandle | null = null;

    if (!story.fullPage && !storyErr && rootElement) {
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

      let elementHeight = 0;
      while (trialTimes < maxTrials) {
        trialTimes++;
        const { isVisible, height } = await page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { isVisible: rect.height > 0 && rect.width > 0, height: rect.height };
        }, captureElement);

        if (isVisible) {
          elementHeight = height;
          break;
        }

        await sleep(delayInterval);
      }

      if (trialTimes === maxTrials) {
        // this case are mostly happen when the story have element that is absolute or fixed, like modal, tooltip, etc
        logger.warn("Cannot detect size of story " + story.id);
        GlobalChannel.sendGlobalMessage({
          type: "warn",
          message: `Cannot detect size of story ${story.id}\nscreenshotting the whole page instead`,
        });
        await page.screenshot({ path: filepath });
      } else {
        if (elementHeight > viewport.height) {
          await page.setViewport({ width: viewport.width, height: elementHeight });
        }

        const delayBeforeCapture = story.delay;
        if (delayBeforeCapture) {
          await sleep(delayBeforeCapture);
        }
        await captureElement.screenshot({ path: filepath });
      }
    } else {
      const delayBeforeCapture = story.delay;
      if (delayBeforeCapture) {
        await sleep(delayBeforeCapture);
      }
      await page.screenshot({ path: filepath });
    }

    await page.close();
    this.result[jobIndex] = {
      id: story.id,
      name: story.name,
      tags: story.tags,
      title: story.title,
      storyErr,
      defaultViewport: story.defaultViewport,
      skip: story.skip,
      fullPage: story.fullPage,
      delay: story.delay,
      disableCssAnimation: story.disableCssAnimation,
      selectorsForHiddenElements: story.selectorsForHiddenElements,
    };

    this.onStoryStateChange(story.id, StoryState.FINISHED, worker.name, storyErr);
  }
}
