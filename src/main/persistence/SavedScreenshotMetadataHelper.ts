import path from "path";
import fs from "fs-extra";
import { logger } from "../logger";
import { FilepathHelper } from "../Filepath";
import type { SavedScreenshotMetadata } from "../../shared/type";

export class SavedScreenshotMetadataHelper {
  public static async save(saveMetaData: SavedScreenshotMetadata): Promise<void> {
    const { project, branch, id } = saveMetaData;
    const dest = FilepathHelper.savedScreenshotMetadataPath(project, branch, id);
    await fs.writeJSON(dest, saveMetaData);
  }

  public static async read(project: string, branch: string, id: string): Promise<SavedScreenshotMetadata | null> {
    try {
      const metadataFilePath = FilepathHelper.savedScreenshotMetadataPath(project, branch, id);
      return await fs.readJSON(metadataFilePath);
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }

  public static async readInDir(dir: string): Promise<SavedScreenshotMetadata | null> {
    try {
      const metadataFilePath = path.join(dir, FilepathHelper.savedScreenshotMetadataFilename());
      return await fs.readJSON(metadataFilePath);
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
