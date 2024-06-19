import { openInExplorer } from "../utils";
import { FilepathHelper } from "../Filepath";
import { ScreenshotChannelKey } from "../../shared/ScreenshotApi";
import { registerHandlers } from "./register-handlers";
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
      save: async (_, req) => await service.save(req.project, req.branch, req.name),
    },
  };

  registerHandlers(ScreenshotChannelKey, handler);
}
