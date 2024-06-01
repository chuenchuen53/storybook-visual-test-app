import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { logger } from "../logger";
import type { TempScreenshotMetadata } from "../../shared/type";

export class TempScreenshotMetadataHelper {
  public static async save(saveMetaData: TempScreenshotMetadata): Promise<void> {
    await fs.writeJSON(FilepathHelper.tempScreenshotMetadataPath(), saveMetaData);
  }

  public static async read(): Promise<TempScreenshotMetadata | null> {
    try {
      return await fs.readJSON(FilepathHelper.tempScreenshotMetadataPath());
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
