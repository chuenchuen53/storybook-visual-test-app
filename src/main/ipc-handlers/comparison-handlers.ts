import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { FilepathHelper } from "../Filepath";
import { ComparisonChannelKey } from "../../shared/ComparisonApi";
import type { ComparisonApi } from "../../shared/ComparisonApi";
import type { ComparisonService } from "../service/ComparisonService";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";

export function registerComparisonHandlers(service: ComparisonService) {
  const handler: IpcMainHandler<ComparisonApi> = {
    send: {
      openInExplorer: () => {
        openInExplorer(FilepathHelper.tempComparisonDir());
      },
    },
    invoke: {
      getAvailableSets: async (_, project) => {
        return await service.getAvailableSets(project);
      },
      compare: async (_, req) => {
        return await service.compare(req.ref, req.test);
      },
      saveComparisonResult: async (_, name) => {
        return await service.saveComparison(name);
      },
    },
  };

  ipcMain.on(ComparisonChannelKey.send.openInExplorer, handler.send.openInExplorer);

  ipcMain.handle(ComparisonChannelKey.invoke.getAvailableSets, handler.invoke.getAvailableSets);

  ipcMain.handle(ComparisonChannelKey.invoke.compare, handler.invoke.compare);

  ipcMain.handle(ComparisonChannelKey.invoke.saveComparisonResult, handler.invoke.saveComparisonResult);
}
