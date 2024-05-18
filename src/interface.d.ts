import type { SendScreenshotInfoParams } from "./MainWindowHelper";

export interface ScreenshotApi {
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
  onReceiveScreenshotInfo: (callback: (params: SendScreenshotInfoParams) => void) => void;
}

declare global {
  interface Window {
    screenshotApi: ScreenshotApi;
  }
}
