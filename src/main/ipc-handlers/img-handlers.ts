import { ipcMain } from "electron";
import { ImgChannelKey } from "../../shared/ImgApi";
import type { ImgApi } from "../../shared/ImgApi";
import type { ImgService } from "../service/ImgService";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";

export function registerImgHandlers(imgService: ImgService) {
  const handler: IpcMainHandler<ImgApi> = {
    send: {},
    invoke: {
      getTempScreenshotImg: async (_, id) => await imgService.getTempScreenshotImg(id),
      getTempComparisonDiffImg: async (_, id) => await imgService.getTempComparisonDiffImg(id),
      getSavedScreenshotImg: async (_, req) =>
        await imgService.getSavedScreenshotImg(req.project, req.branch, req.setId, req.id),
      getSavedComparisonDiffImg: async (_, req) =>
        await imgService.getSavedComparisonDiffImg(req.project, req.setId, req.id),
    },
  };

  ipcMain.handle(ImgChannelKey.invoke.getTempScreenshotImg, handler.invoke.getTempScreenshotImg);
  ipcMain.handle(ImgChannelKey.invoke.getTempComparisonDiffImg, handler.invoke.getTempComparisonDiffImg);
  ipcMain.handle(ImgChannelKey.invoke.getSavedScreenshotImg, handler.invoke.getSavedScreenshotImg);
  ipcMain.handle(ImgChannelKey.invoke.getSavedComparisonDiffImg, handler.invoke.getSavedComparisonDiffImg);
}
