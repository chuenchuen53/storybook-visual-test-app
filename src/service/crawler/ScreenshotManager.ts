import { sleep } from "../utils";
import type { StoryScreenshot } from "./type";
import type { Browser, ElementHandle } from "puppeteer-core";

function storyUrl(url: string, storyId: string) {
  return `${url}/iframe.html?args=&id=${storyId}`;
}

export interface ExtendedBrowser {
  browser: Browser;
  dockerContainerId: string;
  connectionURL: string;
}

export interface ScreenshotJob {
  storyId: string;
  url: string;
  viewport: { width: number; height: number };
}

export class ScreenshotManager {
  private browsers: ExtendedBrowser[];
  private jobs: ScreenshotJob[] = [];

  constructor(browsers: ExtendedBrowser[]) {
    this.browsers = browsers;
    console.log(browsers.map(x => x.connectionURL));
  }

  async startScreenshot(jobs: ScreenshotJob[]): Promise<StoryScreenshot[]> {
    this.jobs = jobs;
    const results: StoryScreenshot[] = [];

    let nextJobIndex = this.browsers.length;

    await Promise.all(
      this.browsers.map((browser, index) => {
        return new Promise<void>((resolve, reject) => {
          (async () => {
            try {
              if (!(index + 1 > this.jobs.length)) {
                await this.screenshot(browser, index, results);
                while (nextJobIndex < this.jobs.length) {
                  const jobIndex = nextJobIndex++;
                  await this.screenshot(browser, jobIndex, results);
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

    return results;
  }

  private async screenshot(browser: ExtendedBrowser, jobIndex: number, results: StoryScreenshot[]) {
    console.log(`Screenshot ${this.jobs[jobIndex].storyId} by browser with connection url ${browser.connectionURL}`);

    const job = this.jobs[jobIndex];
    const start = Date.now();
    const page = await browser.browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(storyUrl(job.url, job.storyId), {
      timeout: 30000,
      waitUntil: "networkidle0",
    });

    const errorStack = await page.$("#error-stack");
    const storyErr = errorStack ? await page.evaluate(el => el.textContent.trim().length > 0, errorStack) : false;

    const filepath = `temp/test-screenshot/${job.storyId}.png`;

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
        console.log("[Warning]: Element is not visible " + job.storyId);
        await page.screenshot({ path: filepath });
      } else {
        await captureElement.screenshot({ path: filepath });
      }
    } else {
      await page.screenshot({ path: filepath });
    }

    await page.close();
    results[jobIndex] = {
      id: job.storyId,
      timeSpent: Date.now() - start,
      storyErr,
    };
  }
}
