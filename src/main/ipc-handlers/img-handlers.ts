import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { compareDir } from "../Filepath";
import type { ImgService } from "../service/ImgService";
import type { SaveScreenshotType } from "../../shared/type";

export function registerImgHandlers(imgService: ImgService) {
  ipcMain.on("compare:openInExplorer", () => {
    openInExplorer(compareDir);
  });

  ipcMain.handle("img:getScreenshotImg", async (_event, id: string) => {
    return await imgService.getScreenshotImg(id);
  });

  ipcMain.handle("img:getCompareAddImg", async (_event, id: string) => {
    return await imgService.getCompareAddedImg(id);
  });

  ipcMain.handle("img:getCompareRemovedImg", async (_event, id: string) => {
    return await imgService.getCompareRemovedImg(id);
  });

  ipcMain.handle("img:getCompareDiffImg", async (_event, id: string) => {
    return await imgService.getCompareDiffImg(id);
  });

  ipcMain.handle(
    "img:getSavedImg",
    async (_event, type: SaveScreenshotType, project: string, branch: string, uuid: string, id: string) => {
      return await imgService.getSavedImg(type, project, branch, uuid, id);
    },
  );
}
