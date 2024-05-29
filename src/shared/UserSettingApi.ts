import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface UserSettingApi extends IpcApi {
  invoke: {
    getProjectsInTab: () => Promise<string[]>;
    updateProjectsInTab: (projects: string[]) => Promise<boolean>;
  };
}

export const UserSettingChannelKey: IpcChannel<IpcApi> = {
  listen: {},
  send: {},
  invoke: {
    getProjectsInTab: "userSetting:getProjectsInTab",
    updateProjectsInTab: "userSetting:updateProjectsInTab",
  },
};
