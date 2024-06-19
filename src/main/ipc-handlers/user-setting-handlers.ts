import { UserSettingChannelKey } from "../../shared/UserSettingApi";
import { registerHandlers } from "./register-handlers";
import type { UserSettingApi } from "../../shared/UserSettingApi";
import type { IpcMainHandler } from "../../shared/ipc-type-helper";
import type { UserSettingService } from "../service/UserSettingService";

export function registerUserSettingHandlers(service: UserSettingService) {
  const handler: IpcMainHandler<UserSettingApi> = {
    send: {},
    invoke: {
      getAppTheme: async () => await service.getAppTheme(),
      setAppTheme: async (_, theme) => await service.setAppTheme(theme),
      getProjectsInTab: async () => await service.getProjectsInTab(),
      setProjectsInTab: async (_, projects) => await service.setProjectsInTab(projects),
    },
  };

  registerHandlers(UserSettingChannelKey, handler);
}
