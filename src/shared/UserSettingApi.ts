import type { AppTheme } from "./type";
import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface UserSettingApi extends IpcApi {
  invoke: {
    getAppTheme: () => Promise<AppTheme>;
    setAppTheme: (theme: AppTheme) => Promise<boolean>;
    getProjectsInTab: () => Promise<string[]>;
    setProjectsInTab: (projects: string[]) => Promise<boolean>;
  };
}

export const UserSettingChannelKey: IpcChannel<UserSettingApi> = {
  listen: {},
  send: {},
  invoke: {
    getAppTheme: "userSetting:getAppTheme",
    setAppTheme: "userSetting:setAppTheme",
    getProjectsInTab: "userSetting:getProjectsInTab",
    setProjectsInTab: "userSetting:setProjectsInTab",
  },
};
