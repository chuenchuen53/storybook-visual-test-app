import { ipcMain } from "electron";
import { SavedSetChannelKey } from "../../shared/SavedSetApi";
import type { SavedSetApi } from "../../shared/SavedSetApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { SavedSetService } from "../service/SavedSetService";

export function registerSavedSetHandlers(service: SavedSetService) {
  const handler: IpcMainHandler<SavedSetApi> = {
    send: {},
    invoke: {
      getAllSavedProjects: async () => service.getAllSavedProjects(),
      getAllSavedSets: async (_, project) => await service.getAllSavedSets(project),
      getRefOrTestSavedSetMetadata: async (_, req) =>
        await service.getRefOrTestSavedSetMetadata(req.type, req.project, req.branch, req.setId),
      getComparisonSavedSetMetadata: async (_, req) =>
        await service.getComparisonSavedSetMetadata(req.project, req.setId),
    },
  };

  ipcMain.handle(SavedSetChannelKey.invoke.getAllSavedProjects, handler.invoke.getAllSavedProjects);
  ipcMain.handle(SavedSetChannelKey.invoke.getAllSavedSets, handler.invoke.getAllSavedSets);
  ipcMain.handle(SavedSetChannelKey.invoke.getRefOrTestSavedSetMetadata, handler.invoke.getRefOrTestSavedSetMetadata);
  ipcMain.handle(SavedSetChannelKey.invoke.getComparisonSavedSetMetadata, handler.invoke.getComparisonSavedSetMetadata);
}
