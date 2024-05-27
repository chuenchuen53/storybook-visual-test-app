import { ipcMain } from "electron";
import type { SaveScreenshotType } from "../../shared/type";
import type { SavedSetService } from "../service/SavedSetService";

export function registerSavedSetHandlers(savedSetService: SavedSetService) {
  ipcMain.handle("savedSet:getAllRefOrTestBranches", async (event, type: SaveScreenshotType, project: string) => {
    return await savedSetService.getAllRefOrTestBranches(type, project);
  });

  ipcMain.handle(
    "savedSet:getAllRefOrTestSavedSets",
    async (event, type: SaveScreenshotType, project: string, branch: string) => {
      return await savedSetService.getAllRefOrTestSavedSets(type, project, branch);
    },
  );

  ipcMain.handle("savedSet:getAllSavedSets", async (event, project: string) => {
    return await savedSetService.getAllSavedSets(project);
  });

  ipcMain.handle(
    "savedSet:getRefOrTestSavedSetMetadata",
    async (event, type: SaveScreenshotType, project: string, branch: string, setId: string) => {
      return await savedSetService.getRefOrTestSavedSetMetadata(type, project, branch, setId);
    },
  );
}
