import type { RefTestSavedInfo, SavedSets, SaveScreenshotType, StoryScreenshotMetadata } from "../../shared/type";

export interface SavedSetService {
  getAllRefOrTestBranches(type: SaveScreenshotType, project: string): Promise<string[]>;
  getAllRefOrTestSavedSets(type: SaveScreenshotType, project: string, branch: string): Promise<RefTestSavedInfo[]>;

  getAllSavedSets(project: string): Promise<SavedSets>;
  getRefOrTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryScreenshotMetadata[]>;
}
