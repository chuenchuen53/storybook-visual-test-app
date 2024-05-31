import path from "path";
import { ipcMain } from "electron";
import { SavedSetChannelKey } from "../../shared/SavedSetApi";
import { savedComparisonDir, savedReferenceDir, savedTestDir } from "../Filepath";
import { openInExplorer } from "../utils";
import type { SavedSetApi } from "../../shared/SavedSetApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { SavedSetService } from "../service/SavedSetService";

export function registerSavedSetHandlers(service: SavedSetService) {
  const handler: IpcMainHandler<SavedSetApi> = {
    send: {
      openTestRefSetInExplorer: (_, req) => {
        const { type, project, branch, setId } = req;
        const dir = path.join(type === "reference" ? savedReferenceDir : savedTestDir, project, branch, setId);
        openInExplorer(dir);
      },
      openComparisonSetInExplorer: (_, req) => {
        const { project, setId } = req;
        const dir = path.join(savedComparisonDir, project, setId);
        openInExplorer(dir);
      },
    },
    invoke: {
      getAllSavedProjects: async () => service.getAllSavedProjects(),
      getAllSavedSets: async (_, project) => await service.getAllSavedSets(project),
      getRefOrTestSavedSetMetadata: async (_, req) =>
        await service.getRefOrTestSavedSetMetadata(req.type, req.project, req.branch, req.setId),
      getComparisonSavedSetMetadata: async (_, req) =>
        await service.getComparisonSavedSetMetadata(req.project, req.setId),
      deleteRefTestSet: (_, req) => service.deleteRefTestSet(req.type, req.project, req.branch, req.setId),
      deleteComparisonSet: (_, req) => service.deleteComparisonSet(req.project, req.setId),
      deleteRefTestBranch: (_, req) => service.deleteRefTestBranch(req.type, req.project, req.branch),
      deleteProject: (_, req) => service.deleteProject(req.project),
    },
  };

  ipcMain.on(SavedSetChannelKey.send.openTestRefSetInExplorer, handler.send.openTestRefSetInExplorer);
  ipcMain.on(SavedSetChannelKey.send.openComparisonSetInExplorer, handler.send.openComparisonSetInExplorer);

  ipcMain.handle(SavedSetChannelKey.invoke.getAllSavedProjects, handler.invoke.getAllSavedProjects);
  ipcMain.handle(SavedSetChannelKey.invoke.getAllSavedSets, handler.invoke.getAllSavedSets);
  ipcMain.handle(SavedSetChannelKey.invoke.getRefOrTestSavedSetMetadata, handler.invoke.getRefOrTestSavedSetMetadata);
  ipcMain.handle(SavedSetChannelKey.invoke.getComparisonSavedSetMetadata, handler.invoke.getComparisonSavedSetMetadata);
  ipcMain.handle(SavedSetChannelKey.invoke.deleteRefTestSet, handler.invoke.deleteRefTestSet);
  ipcMain.handle(SavedSetChannelKey.invoke.deleteComparisonSet, handler.invoke.deleteComparisonSet);
  ipcMain.handle(SavedSetChannelKey.invoke.deleteRefTestBranch, handler.invoke.deleteRefTestBranch);
  ipcMain.handle(SavedSetChannelKey.invoke.deleteProject, handler.invoke.deleteProject);
}
