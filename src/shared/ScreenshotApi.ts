import type {
  SaveScreenshotRequest,
  SaveScreenshotResponse,
  ScreenshotState,
  CreateNewScreenshotSetRequest,
  StoryMetadata,
  StoryStateUpdateData,
} from "./type";
import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface ScreenshotApi extends IpcApi {
  listen: {
    onUpdateStatus: (cb: (status: ScreenshotState) => void) => void;
    onNewMetadata: (cb: (storyMetadataList: StoryMetadata[]) => void) => void;
    onUpdateStoryState: (cb: (data: StoryStateUpdateData) => void) => void;
  };
  send: {
    openInExplorer: () => void;
    createNewSet: (req: CreateNewScreenshotSetRequest) => void;
  };
  invoke: {
    getLocalIPAddress: () => Promise<string | undefined>;
    save: (params: SaveScreenshotRequest) => Promise<SaveScreenshotResponse>;
  };
}

export const ScreenshotChannelKey: IpcChannel<ScreenshotApi> = {
  listen: {
    onUpdateStatus: "screenshot:onUpdateStatus",
    onNewMetadata: "screenshot:onNewMetadata",
    onUpdateStoryState: "screenshot:onUpdateStoryState",
  },
  send: {
    openInExplorer: "screenshot:openInExplorer",
    createNewSet: "screenshot:createNewSet",
  },
  invoke: {
    getLocalIPAddress: "screenshot:getLocalIPAddress",
    save: "screenshot:save",
  },
};
