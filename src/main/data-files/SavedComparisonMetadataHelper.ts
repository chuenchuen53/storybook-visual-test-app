import path from "path";
import fs from "fs-extra";
import { comparisonMetadataFilename, savedComparisonDir } from "../Filepath";
import { logger } from "../logger";
import type { SavedComparisonMetadata } from "../../shared/type";

export class SavedComparisonMetadataHelper {
  public static async save(data: SavedComparisonMetadata): Promise<void> {
    const metadataFilePath = SavedComparisonMetadataHelper.getFilepath(data.project, data.id);
    await fs.writeJSON(metadataFilePath, data);
  }

  public static async read(project: string, id: string): Promise<SavedComparisonMetadata | null> {
    try {
      const metadataFilePath = SavedComparisonMetadataHelper.getFilepath(project, id);
      return await fs.readJSON(metadataFilePath);
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }

  private static getFilepath(project: string, setId: string): string {
    return path.join(savedComparisonDir, project, setId, comparisonMetadataFilename);
  }
}
