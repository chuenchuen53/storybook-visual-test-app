import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { logger } from "../logger";
import type { SavedComparisonMetadata } from "../../shared/type";

export class SavedComparisonMetadataHelper {
  public static async save(data: SavedComparisonMetadata): Promise<void> {
    const metadataFilePath = FilepathHelper.savedComparisonMetadataPath(data.project, data.id);
    await fs.writeJSON(metadataFilePath, data);
  }

  public static async read(project: string, id: string): Promise<SavedComparisonMetadata | null> {
    try {
      const metadataFilePath = FilepathHelper.savedComparisonMetadataPath(project, id);
      return await fs.readJSON(metadataFilePath);
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
