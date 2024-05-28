import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { ComparisonRequest, ComparisonResponse, GetAvailableSetResponse, SavedScreenshotResponse } from "./type";

export interface ComparisonApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openInExplorer: () => void;
  };
  invoke: {
    getAvailableProjects: () => Promise<string[]>;
    getAvailableSets: (projectName: string) => Promise<GetAvailableSetResponse>;
    compare: (req: ComparisonRequest) => Promise<ComparisonResponse>;
    saveComparisonResult: () => Promise<SavedScreenshotResponse>;
  };
}

export const ComparisonChannelKey: IpcChannel<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: "compare:openInExplorer",
  },
  invoke: {
    getAvailableProjects: "compare:getAvailableProjects",
    getAvailableSets: "compare:getAvailableSets",
    compare: "compare:compare",
    saveComparisonResult: "compare:saveComparison",
  },
};
