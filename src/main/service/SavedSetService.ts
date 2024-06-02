import type {
  GetComparisonSavedSetMetadataResponse,
  SavedSets,
  SaveScreenshotType,
  StoryMetadataWithRenderStatus,
} from "../../shared/type";

export interface SavedSetService {
  getAllSavedProjects(): Promise<string[]>;
  getAllSavedSets(project: string): Promise<SavedSets>;
  getRefOrTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryMetadataWithRenderStatus[]>;
  getComparisonSavedSetMetadata(project: string, setId: string): Promise<GetComparisonSavedSetMetadataResponse>;
  deleteRefTestSet(type: SaveScreenshotType, project: string, branch: string, setId: string): Promise<SavedSets | null>;
  deleteComparisonSet(project: string, setId: string): Promise<SavedSets | null>;
  deleteRefTestBranch(type: SaveScreenshotType, project: string, branch: string): Promise<SavedSets | null>;
  deleteProject(project: string): Promise<boolean>;
}
