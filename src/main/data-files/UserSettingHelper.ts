import fs from "fs-extra";
import { userSettingFilepath } from "../Filepath";
import { logger } from "../logger";
import type { UserSetting } from "../../shared/type";

export class UserSettingHelper {
  private static readonly filepath = userSettingFilepath;

  public static async read(): Promise<UserSetting | null> {
    const isExist = await fs.pathExists(UserSettingHelper.filepath);
    if (!isExist) return null;
    try {
      return await fs.readJSON(UserSettingHelper.filepath);
    } catch (error) {
      logger.error("Error reading user setting:", error);
      return null;
    }
  }

  public static save() {}
}
