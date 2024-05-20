import type { SendScreenshotInfoParams } from "./MainWindowHelper";
import type { StoriesDiffResult } from "./service/stories-differ/StoriesDiffer";

export type SaveScreenshotType = "reference" | "test";

export interface SavedScreenshotResponse {
  success: boolean;
  errMsg?: string;
}

export interface SavedScreenshotResponse {
  success: boolean;
  errMsg?: string;
}

export interface CompareResponse {
  uuid: string;
  createAt: string;
  project: string;
  refBranch: string;
  testBranch: string;
  refId: string;
  testSetId: string;
  result: StoriesDiffResult;
}

export interface SetData {
  branch: string;
  setList: { uuid: string; createAt: string; viewport: { width: number; height: number } }[];
}

export interface GetAvailableSetResponse {
  ref: SetData[];
  test: SetData[];
}

export interface GetImgResponse {
  isExist: boolean;
  base64: string | null;
}

export interface ImgApi {
  getScreenshotImg: (id: string) => Promise<GetImgResponse>;
  getCompareAddedImg: (id: string) => Promise<GetImgResponse>;
  getCompareRemovedImg: (id: string) => Promise<GetImgResponse>;
  getCompareDiffImg: (id: string) => Promise<GetImgResponse>;
  getSavedImg: (
    type: SaveScreenshotType,
    project: string,
    branch: string,
    uuid: string,
    id: string,
  ) => Promise<GetImgResponse>;
}

export interface ScreenshotApi {
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
  onReceiveScreenshotInfo: (callback: (params: SendScreenshotInfoParams) => void) => void;
  openInExplorer: () => void;
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) => Promise<SavedScreenshotResponse>;
}

export interface CompareApi {
  getAvailableProjects: () => Promise<string[]>;
  getAvailableSets: (projectName: string) => Promise<GetAvailableSetResponse>;
  compare: (relativeRefDir: string, relativeTestDir: string) => Promise<CompareResponse>;
  openInExplorer: () => void;
  saveComparisonResult: () => Promise<SavedScreenshotResponse>;
}

declare global {
  interface Window {
    imgApi: ImgApi;
    screenshotApi: ScreenshotApi;
    compareApi: CompareApi;
  }
}
