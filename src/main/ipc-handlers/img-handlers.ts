import { ipcMain } from "electron";
import { ImgChannelKey } from "../../shared/ImgApi";
import type { ImgApi } from "../../shared/ImgApi";
import type { ImgService } from "../service/ImgService";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";

export function registerImgHandlers(imgService: ImgService) {
  const handler: IpcMainHandler<ImgApi> = {
    send: {},
    invoke: {
      getScreenshotImg: async (_, id) => await imgService.getScreenshotImg(id),
      getCompareAddedImg: async (_, id) => await imgService.getCompareAddedImg(id),
      getCompareRemovedImg: async (_, id) => await imgService.getCompareRemovedImg(id),
      getCompareDiffImg: async (_, id) => await imgService.getCompareDiffImg(id),
      getSavedImg: async (_, req) => await imgService.getSavedImg(req.type, req.project, req.branch, req.setId, req.id),
    },
  };

  ipcMain.handle(ImgChannelKey.invoke.getScreenshotImg, handler.invoke.getScreenshotImg);
  ipcMain.handle(ImgChannelKey.invoke.getCompareAddedImg, handler.invoke.getCompareAddedImg);
  ipcMain.handle(ImgChannelKey.invoke.getCompareRemovedImg, handler.invoke.getCompareRemovedImg);
  ipcMain.handle(ImgChannelKey.invoke.getCompareDiffImg, handler.invoke.getCompareDiffImg);
  ipcMain.handle(ImgChannelKey.invoke.getSavedImg, handler.invoke.getSavedImg);
}
