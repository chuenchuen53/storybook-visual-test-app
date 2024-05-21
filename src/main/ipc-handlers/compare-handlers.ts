import path from "path";
import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { compareDir, savedReferenceDir, savedTestDir } from "../Filepath";
import type { CompareResponse, GetAvailableSetResponse, SavedScreenshotResponse } from "../../shared/type";
import type { CompareService } from "../service/CompareService";

export function registerCompareHandlers(compareService: CompareService) {
  ipcMain.on("compare:openInExplorer", (): void => {
    openInExplorer(compareDir);
  });

  ipcMain.handle("compare:getAvailableProjects", async (): Promise<string[]> => {
    return await compareService.getAvailableProjects();
  });

  ipcMain.handle("compare:getAvailableSets", async (_event, project: string): Promise<GetAvailableSetResponse> => {
    return await compareService.getAvailableSets(project);
  });

  ipcMain.handle(
    "compare:compare",
    async (_event, relativeRefDir: string, relativeTestDir: string): Promise<CompareResponse> => {
      const refDir = path.join(savedReferenceDir, relativeRefDir);
      const testDir = path.join(savedTestDir, relativeTestDir);
      return await compareService.compare(refDir, testDir);
    },
  );

  ipcMain.handle("compare:saveComparison", async (): Promise<SavedScreenshotResponse> => {
    return await compareService.saveComparison();
  });
}
