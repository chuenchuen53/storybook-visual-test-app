import type {
  CompareResponse,
  GetAvailableSetResponse,
  GetImgResponse,
  GlobalMessage,
  RefTestSavedInfo,
  SavedScreenshotResponse,
  SavedSets,
  SaveScreenshotType,
  ScreenshotState,
  StoryMetadata,
  StoryScreenshotMetadata,
  StoryState,
} from "./shared/type";

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

export interface ScreenshotApi {
  onUpdateStatus: (cb: (status: ScreenshotState) => void) => void;
  onNewMetadata: (cb: (storyMetadataList: StoryMetadata[]) => void) => void;
  onUpdateStoryState: (
    cb: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ) => void;

  openInExplorer: () => void;
  getLocalIPAddress: () => Promise<string> | Promise<undefined>;
  startScreenshot: (url: string) => Promise<void>;
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) => Promise<SavedScreenshotResponse>;
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
