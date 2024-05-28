import path from "path";
import fs from "fs-extra";
import { logger } from "../logger";
import { savedReferenceDir, savedTestDir, screenshotMetadataFilename } from "../Filepath";
import type { SavedScreenshotMetadata, SaveScreenshotType } from "../../shared/type";

export class SavedScreenshotMetadataHelper {
  public static async save(saveMetaData: SavedScreenshotMetadata): Promise<void> {
    const { type, project, branch, id } = saveMetaData;
    const dest = SavedScreenshotMetadataHelper.getFilepath(type, project, branch, id);
    await fs.writeJSON(dest, saveMetaData);
  }

  public static async read(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    id: string,
  ): Promise<SavedScreenshotMetadata | null> {
    try {
      const metadataFilePath = SavedScreenshotMetadataHelper.getFilepath(type, project, branch, id);
      return await fs.readJSON(metadataFilePath);
    } catch (error) {
      logger.error("Error reading metadata:", error);
      return null;
    }
  }

  private static getFilepath(type: SaveScreenshotType, project: string, branch: string, id: string): string {
    const typeDir = type === "reference" ? savedReferenceDir : savedTestDir;
    return path.join(typeDir, project, branch, id, screenshotMetadataFilename);
  }
}
