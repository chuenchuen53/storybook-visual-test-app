import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { logger } from "../logger";
import type { ComparisonResponse$Data } from "../../shared/type";

export class TempComparisonMetadataHelper {
  public static async save(data: ComparisonResponse$Data): Promise<void> {
    await fs.writeJSON(FilepathHelper.tempComparisonMetadataPath(), data);
  }

  public static async read(): Promise<ComparisonResponse$Data | null> {
    try {
      return await fs.readJSON(FilepathHelper.tempComparisonMetadataPath());
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
