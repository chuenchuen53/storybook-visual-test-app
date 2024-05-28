import type { SetData, ComparisonResponse, GetAvailableSetResponse, SavedScreenshotResponse } from "../../shared/type";

export interface ComparisonService {
  getAvailableProjects(): Promise<string[]>;
  getAvailableSets(project: string): Promise<GetAvailableSetResponse>;
  compare(refSet: SetData, testSet: SetData): Promise<ComparisonResponse>;
  saveComparison(): Promise<SavedScreenshotResponse>;
}
