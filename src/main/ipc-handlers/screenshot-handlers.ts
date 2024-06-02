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
      openInExplorer: () => openInExplorer(FilepathHelper.tempScreenshotDir()),
      createNewSet: (_, req) => void service.createNewSet(req.storybookUrl, req.viewport, req.concurrency),
    },
    invoke: {
      getLocalIPAddress: async _ => service.getLocalIPAddress(),
      save: async (_, req) => await service.save(req.type, req.project, req.branch, req.name),
    },
  };

  ipcMain.on(ScreenshotChannelKey.send.openInExplorer, handler.send.openInExplorer);
  ipcMain.on(ScreenshotChannelKey.send.createNewSet, handler.send.createNewSet);

  ipcMain.handle(ScreenshotChannelKey.invoke.getLocalIPAddress, handler.invoke.getLocalIPAddress);
  ipcMain.handle(ScreenshotChannelKey.invoke.save, handler.invoke.save);
}
