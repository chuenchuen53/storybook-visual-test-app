import path from "path";
import fs from "fs-extra";
import { comparisonDir, comparisonMetadataFilename } from "../Filepath";
import { logger } from "../logger";
import type { ComparisonResponse$Data } from "../../shared/type";

export class TempComparisonMetadataHelper {
  private static readonly resultFilePath = path.join(comparisonDir, comparisonMetadataFilename);

  public static async save(data: ComparisonResponse$Data): Promise<void> {
    await fs.writeJSON(TempComparisonMetadataHelper.resultFilePath, data);
  }

  public static async read(): Promise<ComparisonResponse$Data | null> {
    try {
      return await fs.readJSON(TempComparisonMetadataHelper.resultFilePath);
    } catch (error) {
      logger.error(error, "Error reading metadata:");
      return null;
    }
  }
}
