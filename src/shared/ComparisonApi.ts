import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { CreateNewComparisonSetRequest, CreateNewComparisonSetResponse, SaveScreenshotResponse } from "./type";

export interface ComparisonApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openInExplorer: () => void;
  };
  invoke: {
    compare: (req: CreateNewComparisonSetRequest) => Promise<CreateNewComparisonSetResponse>;
    save: (name: string) => Promise<SaveScreenshotResponse>;
  };
}

export const ComparisonChannelKey: IpcChannel<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: "comparison:openInExplorer",
  },
  invoke: {
    compare: "comparison:compare",
    save: "comparison:save",
  },
};
