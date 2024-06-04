import type {
  CreateNewComparisonSetResponse,
  SaveComparisonResponse,
  SavedScreenshotSetLocationIdentifier,
} from "../../shared/type";

export interface ComparisonService {
  compare(
    refSet: SavedScreenshotSetLocationIdentifier,
    testSet: SavedScreenshotSetLocationIdentifier,
  ): Promise<CreateNewComparisonSetResponse>;
  save(name: string): Promise<SaveComparisonResponse>;
}
