import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { FilepathHelper } from "../Filepath";
import { ScreenshotChannelKey } from "../../shared/ScreenshotApi";
import type { ScreenshotApi } from "../../shared/ScreenshotApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { ScreenshotService } from "../service/ScreenshotService";

export function registerScreenshotHandlers(service: ScreenshotService) {
  const handler: IpcMainHandler<ScreenshotApi> = {
    send: {
      openInExplorer: () => {
        openInExplorer(FilepathHelper.tempScreenshotDir());
      },
      startScreenshot: (_, req) => {
        void service.newScreenshotSet(req.storybookUrl, req.viewport, req.concurrency);
      },
    },
    invoke: {
      getLocalIPAddress: async _ => {
        return service.getLocalIPAddress();
      },
      saveScreenshot: async (_, req) => {
        return await service.saveScreenshot(req.type, req.project, req.branch, req.name);
      },
    },
  };

  ipcMain.on(ScreenshotChannelKey.send.openInExplorer, handler.send.openInExplorer);

  ipcMain.on(ScreenshotChannelKey.send.startScreenshot, handler.send.startScreenshot);

  ipcMain.handle(ScreenshotChannelKey.invoke.getLocalIPAddress, handler.invoke.getLocalIPAddress);

  ipcMain.handle(ScreenshotChannelKey.invoke.saveScreenshot, handler.invoke.saveScreenshot);
}
