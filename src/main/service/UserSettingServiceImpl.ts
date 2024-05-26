import fs from "fs-extra";
import { logger } from "../logger";
import { userSettingFilepath } from "../Filepath";
import type { UserSetting } from "../../shared/type";
import type { UserSettingService } from "./UserSettingService";

export class UserSettingServiceImpl implements UserSettingService {
  private static readonly instance: UserSettingService = new UserSettingServiceImpl();

  private constructor() {
    // singleton
  }

  public static getInstance(): UserSettingService {
    return UserSettingServiceImpl.instance;
  }

  public async getProjectsInTab(): Promise<string[]> {
    try {
      const isFileExist = await fs.pathExists(userSettingFilepath);
      if (!isFileExist) {
        return [];
      }
      const setting: UserSetting = await fs.readJson(userSettingFilepath);
      return setting.projectsInTab ?? [];
    } catch (e) {
      logger.error(e);
      return [];
    }
  }

  public async updateProjectsInTab(projects: string[]): Promise<boolean> {
    try {
      const isFileExist = await fs.pathExists(userSettingFilepath);
      const setting: UserSetting = isFileExist ? await fs.readJson(userSettingFilepath) : {};
      setting.projectsInTab = projects;
      await fs.writeJson(userSettingFilepath, setting);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  }
}
