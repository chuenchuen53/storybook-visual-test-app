import type {
  GetComparisonSavedSetMetadataResponse,
  SavedSets,
  SaveScreenshotType,
  StoryScreenshotMetadata,
} from "../../shared/type";

export interface SavedSetService {
  getAllSavedProjects(): Promise<string[]>;
  getAllSavedSets(project: string): Promise<SavedSets>;
  getRefOrTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryScreenshotMetadata[]>;
  getComparisonSavedSetMetadata(project: string, setId: string): Promise<GetComparisonSavedSetMetadataResponse>;
}
