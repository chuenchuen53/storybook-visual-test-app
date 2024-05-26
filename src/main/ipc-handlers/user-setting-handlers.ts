import { ipcMain } from "electron";
import type { UserSettingService } from "../service/UserSettingService";

export function registerUserSettingHandlers(userSettingService: UserSettingService) {
  ipcMain.handle("userSetting:getProjectsInTab", async () => {
    return userSettingService.getProjectsInTab();
  });

  ipcMain.handle("userSetting:updateProjectsInTab", async (_event, projects: string[]) => {
    return userSettingService.updateProjectsInTab(projects);
  });
}
