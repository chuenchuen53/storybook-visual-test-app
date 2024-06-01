import type { ComparisonResponse, GetAvailableSetResponse, SavedScreenshotResponse, SetData } from "../../shared/type";

export interface ComparisonService {
  getAvailableSets(project: string): Promise<GetAvailableSetResponse>;
  compare(refSet: SetData, testSet: SetData): Promise<ComparisonResponse>;
  saveComparison(name: string): Promise<SavedScreenshotResponse>;
}
