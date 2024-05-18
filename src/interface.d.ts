export interface ScreenshotApi {
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    screenshotApi: ScreenshotApi;
  }
}
