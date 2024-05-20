import type { SendScreenshotInfoParams } from "./MainWindowHelper";

export type SaveScreenshotType = "reference" | "test";

export interface SavedScreenshotResponse {
  success: boolean;
  errMsg?: string;
}

export interface ImgApi {
  getScreenshotImg: (id: string) => Promise<{ isExist: boolean; base64: string | null }>;
}

export interface ScreenshotApi {
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
  onReceiveScreenshotInfo: (callback: (params: SendScreenshotInfoParams) => void) => void;
  openInExplorer: () => void;
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) => Promise<SavedScreenshotResponse>;
}

declare global {
  interface Window {
    imgApi: ImgApi;
    screenshotApi: ScreenshotApi;
  }
}
