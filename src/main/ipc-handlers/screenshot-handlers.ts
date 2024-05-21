import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { screenshotDir } from "../Filepath";
import type { ScreenshotService } from "../service/ScreenshotService";
import type { SavedScreenshotResponse, SaveScreenshotType } from "../../shared/type";

export function registerScreenshotHandlers(screenshotService: ScreenshotService) {
  ipcMain.on("screenshot:openInExplorer", () => {
    openInExplorer(screenshotDir);
  });

  ipcMain.handle("screenshot:getLocalIPAddress", () => screenshotService.getLocalIPAddress());

  ipcMain.handle("screenshot:startScreenshot", (_event, url: string) => {
    void screenshotService.newScreenshotSet(url);
  });

  ipcMain.handle(
    "screenshot:save",
    async (_event, project: string, branch: string, type: SaveScreenshotType): Promise<SavedScreenshotResponse> => {
      return await screenshotService.saveScreenshot(project, branch, type);
    },
  );
}
