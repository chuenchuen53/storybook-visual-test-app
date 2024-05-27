import type {
  CompareResponse,
  GetAvailableSetResponse,
  GetImgResponse,
  GlobalMessage,
  RefTestSavedInfo,
  SavedScreenshotResponse,
  SavedSets,
  SaveScreenshotType,
  StoryScreenshotMetadata,
} from "./shared/type";

import type { ScreenshotApi } from "./shared/ScreenshotApi";

export interface GlobalApi {
  onReceiveGlobalMessage: (cb: (msg: GlobalMessage) => void) => void;
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

export interface UserSettingApi {
  getProjectsInTab: () => Promise<string[]>;
  updateProjectsInTab: (projects: string[]) => Promise<boolean>;
}

export interface CompareApi {
  openInExplorer: () => void;
  getAvailableProjects: () => Promise<string[]>;
  getAvailableSets: (projectName: string) => Promise<GetAvailableSetResponse>;
  compare: (relativeRefDir: string, relativeTestDir: string) => Promise<CompareResponse>;
  saveComparisonResult: () => Promise<SavedScreenshotResponse>;
}

export interface SavedSetApi {
  getAllRefOrTestBranches: (type: SaveScreenshotType, project: string) => Promise<string[]>;
  getAllRefOrTestSavedSets: (type: SaveScreenshotType, project: string, branch: string) => Promise<RefTestSavedInfo[]>;
  getAllSavedSets: (project: string) => Promise<SavedSets>;
  getRefOrTestSavedSetMetadata: (
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ) => Promise<StoryScreenshotMetadata[]>;
}

declare global {
  interface Window {
    globalApi: GlobalApi;
    userSettingApi: UserSettingApi;
    imgApi: ImgApi;
    screenshotApi: ScreenshotApi;
    compareApi: CompareApi;
    savedSetApi: SavedSetApi;
  }
}
