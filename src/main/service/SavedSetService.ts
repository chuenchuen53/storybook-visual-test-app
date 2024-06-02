import type { GetAllSavedSetsResponse, SaveScreenshotType, GetAllSavedRefTestSetsResponse } from "../../shared/type";

export interface SavedSetService {
  getAllSavedProjects(): Promise<string[]>;
  getAllSavedRefTestSets(project: string): Promise<GetAllSavedRefTestSetsResponse>;
  getAllSavedSets(project: string): Promise<GetAllSavedSetsResponse>;
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
