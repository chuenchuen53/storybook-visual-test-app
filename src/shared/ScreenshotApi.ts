import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { SavedScreenshotResponse, SaveScreenshotType, ScreenshotState, StoryMetadata, StoryState } from "./type";

export interface SaveScreenshotRequest {
  project: string;
  branch: string;
  type: SaveScreenshotType;
}

export interface StoryUpdateEventData {
  storyId: string;
  state: StoryState;
  browserName: string;
  storyErr: boolean | null;
}

export interface ScreenshotApi extends IpcApi {
  listen: {
    onUpdateStatus: (cb: (status: ScreenshotState) => void) => void;
    onNewMetadata: (cb: (storyMetadataList: StoryMetadata[]) => void) => void;
    onUpdateStoryState: (cb: (params: StoryUpdateEventData) => void) => void;
  };
  send: {
    openInExplorer: () => void;
    startScreenshot: (url: string) => void;
  };
  invoke: {
    getLocalIPAddress: () => Promise<string | undefined>;
    saveScreenshot: (params: SaveScreenshotRequest) => Promise<SavedScreenshotResponse>;
  };
}

export const ScreenshotChannelKey: IpcChannel<ScreenshotApi> = {
  listen: {
    onUpdateStatus: "screenshot:updateStatus",
    onNewMetadata: "screenshot:newMetadata",
    onUpdateStoryState: "screenshot:updateStoryState",
  },
  send: {
    openInExplorer: "screenshot:openInExplorer",
    startScreenshot: "screenshot:startScreenshot",
  },
  invoke: {
    getLocalIPAddress: "screenshot:getLocalIPAddress",
    saveScreenshot: "screenshot:save",
  },
};
