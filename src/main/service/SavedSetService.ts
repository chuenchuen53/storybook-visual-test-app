import type {
  GetAllSavedSetsResponse,
  GetAllSavedScreenshotSetsResponse,
  GetSavedComparisonMetadataResponse,
  GetSavedScreenshotMetadataResponse,
} from "../../shared/type";

export interface SavedSetService {
  getAllSavedProjects(): Promise<string[]>;
  getAllSavedScreenshotSets(project: string): Promise<GetAllSavedScreenshotSetsResponse>;
  getAllSavedSets(project: string): Promise<GetAllSavedSetsResponse>;
  getSavedScreenshotMetadata(
    project: string,
    branch: string,
    setId: string,
  ): Promise<GetSavedScreenshotMetadataResponse>;
  getSavedComparisonMetadata(project: string, setId: string): Promise<GetSavedComparisonMetadataResponse>;
  deleteScreenshotSet(project: string, branch: string, setId: string): Promise<GetAllSavedSetsResponse | null>;
  deleteComparisonSet(project: string, setId: string): Promise<GetAllSavedSetsResponse | null>;
  deleteScreenshotBranch(project: string, branch: string): Promise<GetAllSavedSetsResponse | null>;
  deleteProject(project: string): Promise<boolean>;
}
