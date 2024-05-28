import path from "path";
import fs from "fs-extra";
import { screenshotDir, screenshotMetadataFilename } from "../Filepath";
import { logger } from "../logger";
import type { TempScreenshotMetadata } from "../../shared/type";

export class TempScreenshotMetadataHelper {
  private static readonly metadataFilePath = path.join(screenshotDir, screenshotMetadataFilename);

  public static async save(saveMetaData: TempScreenshotMetadata): Promise<void> {
    await fs.writeJSON(TempScreenshotMetadataHelper.metadataFilePath, saveMetaData);
  }

  public static async read(): Promise<TempScreenshotMetadata | null> {
    try {
      return await fs.readJSON(TempScreenshotMetadataHelper.metadataFilePath);
    } catch (error) {
      logger.error("Error reading metadata:", error);
      return null;
    }
  }
}
