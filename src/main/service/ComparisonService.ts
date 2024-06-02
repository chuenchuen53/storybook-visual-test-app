import type {
  CreateNewComparisonSetResponse,
  SaveScreenshotResponse,
  SavedScreenshotSetLocationIdentifier,
} from "../../shared/type";

export interface ComparisonService {
  compare(
    refSet: SavedScreenshotSetLocationIdentifier,
    testSet: SavedScreenshotSetLocationIdentifier,
  ): Promise<CreateNewComparisonSetResponse>;
  save(name: string): Promise<SaveScreenshotResponse>;
}
