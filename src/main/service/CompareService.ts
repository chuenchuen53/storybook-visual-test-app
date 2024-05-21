import type { CompareResponse, GetAvailableSetResponse, SavedScreenshotResponse } from "../../shared/type";

export interface CompareService {
  getAvailableProjects(): Promise<string[]>;
  getAvailableSets(projectName: string): Promise<GetAvailableSetResponse>;
  compare(refDir: string, testDir: string): Promise<CompareResponse>;
  saveComparison(): Promise<SavedScreenshotResponse>;
}
