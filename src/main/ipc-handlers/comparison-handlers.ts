import { openInExplorer } from "../utils";
import { FilepathHelper } from "../Filepath";
import { ComparisonChannelKey } from "../../shared/ComparisonApi";
import { registerHandlers } from "./register-handlers";
import type { ComparisonApi } from "../../shared/ComparisonApi";
import type { ComparisonService } from "../service/ComparisonService";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";

export function registerComparisonHandlers(service: ComparisonService) {
  const handler: IpcMainHandler<ComparisonApi> = {
    send: {
      openInExplorer: () => openInExplorer(FilepathHelper.tempComparisonDir()),
    },
    invoke: {
      compare: async (_, req) => await service.compare(req.ref, req.test),
      save: async (_, name) => await service.save(name),
    },
  };

  registerHandlers(ComparisonChannelKey, handler);
}
