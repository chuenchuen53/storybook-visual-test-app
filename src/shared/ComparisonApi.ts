import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { ComparisonRequest, ComparisonResponse, GetAvailableSetResponse, SaveScreenshotResponse } from "./type";

export interface ComparisonApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openInExplorer: () => void;
  };
  invoke: {
    getAvailableSets: (project: string) => Promise<GetAvailableSetResponse>;
    compare: (req: ComparisonRequest) => Promise<ComparisonResponse>;
    save: (name: string) => Promise<SaveScreenshotResponse>;
  };
}

export const ComparisonChannelKey: IpcChannel<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: "comparison:openInExplorer",
  },
  invoke: {
    getAvailableSets: "comparison:getAvailableSets",
    compare: "comparison:compare",
    save: "comparison:save",
  },
};
