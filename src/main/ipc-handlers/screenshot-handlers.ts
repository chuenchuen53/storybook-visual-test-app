import { ipcMain } from "electron";
import { openInExplorer } from "../utils";
import { screenshotDir } from "../Filepath";
import { ScreenshotChannelKey } from "../../shared/ScreenshotApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { ScreenshotApi } from "../../shared/ScreenshotApi";
import type { ScreenshotService } from "../service/ScreenshotService";

export function registerScreenshotHandlers(service: ScreenshotService) {
  const handler: IpcMainHandler<ScreenshotApi> = {
    send: {
      openInExplorer: () => {
        openInExplorer(screenshotDir);
      },
      startScreenshot: (_, url) => {
        void service.newScreenshotSet(url);
      },
    },
    invoke: {
      getLocalIPAddress: async () => {
        return service.getLocalIPAddress();
      },
      saveScreenshot: async (_, req) => {
        return await service.saveScreenshot(req.project, req.branch, req.type);
      },
    },
  };

  ipcMain.on(ScreenshotChannelKey.send.openInExplorer, handler.send.openInExplorer);

  ipcMain.on(ScreenshotChannelKey.send.startScreenshot, handler.send.startScreenshot);

  ipcMain.handle(ScreenshotChannelKey.invoke.getLocalIPAddress, handler.invoke.getLocalIPAddress);

  ipcMain.handle(ScreenshotChannelKey.invoke.saveScreenshot, handler.invoke.saveScreenshot);
}
