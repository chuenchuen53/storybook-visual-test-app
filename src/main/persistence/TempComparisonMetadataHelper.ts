import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { logger } from "../logger";
import type { TempComparisonMetadata } from "../../shared/type";

export class TempComparisonMetadataHelper {
  public static async save(data: TempComparisonMetadata): Promise<void> {
    await fs.writeJSON(FilepathHelper.tempComparisonMetadataPath(), data);
  }

  public static async read(): Promise<TempComparisonMetadata | null> {
    try {
      return await fs.readJSON(FilepathHelper.tempComparisonMetadataPath());
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
