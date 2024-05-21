import type { SendScreenshotInfoParams } from "./MainWindowHelper";
import type { StoriesDiffResult } from "./main/differ/stories-differ/StoriesDiffer";
import type { StoryState } from "./shared/type";

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

export interface GlobalApi {
  onReceiveGlobalMessage: (cb: (msg: GlobalMessage) => void) => void;
}

export interface ScreenshotApi {
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
  openInExplorer: () => void;
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) => Promise<SavedScreenshotResponse>;
  onUpdateStatus: (callback: (status: ScreenshotState) => void) => void;
  onNewMetadata: (callback: (storyMetadataList: StoryMetadata[]) => void) => void;
  onUpdateStoryState: (
    callback: (storyId: string, state: StoryState, browserName: string | null, storyErr: boolean | null) => void,
  ) => void;
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
    globalApi: GlobalApi;
    imgApi: ImgApi;
    screenshotApi: ScreenshotApi;
    compareApi: CompareApi;
  }
}
