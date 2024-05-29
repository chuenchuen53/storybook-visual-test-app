import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { ComparisonRequest, ComparisonResponse, GetAvailableSetResponse, SavedScreenshotResponse } from "./type";

export interface ComparisonApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openInExplorer: () => void;
  };
  invoke: {
    getAvailableSets: (project: string) => Promise<GetAvailableSetResponse>;
    compare: (req: ComparisonRequest) => Promise<ComparisonResponse>;
    saveComparisonResult: (name: string) => Promise<SavedScreenshotResponse>;
  };
}

export const ComparisonChannelKey: IpcChannel<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: "compare:openInExplorer",
  },
  invoke: {
    getAvailableSets: "compare:getAvailableSets",
    compare: "compare:compare",
    saveComparisonResult: "compare:saveComparison",
  },
};
