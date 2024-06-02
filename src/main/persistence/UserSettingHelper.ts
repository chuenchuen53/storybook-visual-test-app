import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { logger } from "../logger";
import type { UserSetting } from "../../shared/type";

export class UserSettingHelper {
  public static async read(): Promise<UserSetting | null> {
    const filepath = FilepathHelper.userSettingPath();
    const isExist = await fs.pathExists(filepath);
    if (!isExist) return null;
    try {
      return await fs.readJSON(filepath);
    } catch (error) {
      logger.error("Error reading user setting:", error);
      return null;
    }
  }

  public static async save(setting: UserSetting) {
    try {
      const filepath = FilepathHelper.userSettingPath();
      await fs.writeJSON(filepath, setting);
      return true;
    } catch (error) {
      logger.error("Error saving user setting:", error);
      return false;
    }
  }
}
