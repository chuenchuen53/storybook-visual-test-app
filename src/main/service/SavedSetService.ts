import type {
  GetAllSavedSetsResponse,
  SaveScreenshotType,
  GetAllSavedRefTestSetsResponse,
  StoryMetadataWithRenderStatus,
  GetComparisonSavedSetMetadataResponse,
} from "../../shared/type";

export interface SavedSetService {
  getAllSavedProjects(): Promise<string[]>;
  getAllSavedRefTestSets(project: string): Promise<GetAllSavedRefTestSetsResponse>;
  getAllSavedSets(project: string): Promise<GetAllSavedSetsResponse>;
  getRefTestSavedSetMetadata(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<StoryMetadataWithRenderStatus[]>;
  getComparisonSavedSetMetadata(project: string, setId: string): Promise<GetComparisonSavedSetMetadataResponse>;
  deleteRefTestSet(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): Promise<GetAllSavedSetsResponse | null>;
  deleteComparisonSet(project: string, setId: string): Promise<GetAllSavedSetsResponse | null>;
  deleteRefTestBranch(
    type: SaveScreenshotType,
    project: string,
    branch: string,
  ): Promise<GetAllSavedSetsResponse | null>;
  deleteProject(project: string): Promise<boolean>;
}
