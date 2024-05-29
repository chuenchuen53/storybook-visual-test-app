import { ipcMain } from "electron";
import { UserSettingChannelKey } from "../../shared/UserSettingApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { UserSettingApi } from "../../shared/UserSettingApi";
import type { UserSettingService } from "../service/UserSettingService";

export function registerUserSettingHandlers(service: UserSettingService) {
  const handler: IpcMainHandler<UserSettingApi> = {
    send: {},
    invoke: {
      getProjectsInTab: async () => await service.getProjectsInTab(),
      updateProjectsInTab: async (_, projects) => await service.updateProjectsInTab(projects),
    },
  };

  ipcMain.handle(UserSettingChannelKey.invoke.getProjectsInTab, handler.invoke.getProjectsInTab);
  ipcMain.handle(UserSettingChannelKey.invoke.updateProjectsInTab, handler.invoke.updateProjectsInTab);
}
