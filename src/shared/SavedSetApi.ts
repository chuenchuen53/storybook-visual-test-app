import type {
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteScreenshotBranchRequest,
  DeleteScreenshotSetRequest,
  OpenComparisonSetInExplorerRequest,
  OpenScreenshotSetInExplorerRequest,
  GetAllSavedSetsResponse,
  GetAllSavedScreenshotSetsResponse,
  GetSavedComparisonMetadataRequest,
  GetSavedComparisonMetadataResponse,
  GetSavedScreenshotMetadataRequest,
  GetSavedScreenshotMetadataResponse,
} from "./type";
import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface SavedSetApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openScreenshotSetInExplorer: (req: OpenScreenshotSetInExplorerRequest) => void;
    openComparisonSetInExplorer: (req: OpenComparisonSetInExplorerRequest) => void;
  };
  invoke: {
    getAllSavedProjects: () => Promise<string[]>;
    getAllSavedBranches: (project: string) => Promise<string[]>;
    getAllSavedScreenshotSets: (project: string) => Promise<GetAllSavedScreenshotSetsResponse>;
    getAllSavedSets: (project: string) => Promise<GetAllSavedSetsResponse>;
    getSavedScreenshotMetadata: (req: GetSavedScreenshotMetadataRequest) => Promise<GetSavedScreenshotMetadataResponse>;
    getSavedComparisonMetadata: (req: GetSavedComparisonMetadataRequest) => Promise<GetSavedComparisonMetadataResponse>;
    deleteScreenshotSet: (req: DeleteScreenshotSetRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteComparisonSet: (req: DeleteComparisonSetRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteScreenshotBranch: (req: DeleteScreenshotBranchRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteProject: (req: DeleteProjectRequest) => Promise<boolean>;
  };
}

export const SavedSetChannelKey: IpcChannel<SavedSetApi> = {
  listen: {},
  send: {
    openScreenshotSetInExplorer: "savedSet:openScreenshotSetInExplorer",
    openComparisonSetInExplorer: "savedSet:openComparisonSetInExplorer",
  },
  invoke: {
    getAllSavedProjects: "savedSet:getAllSavedProjects",
    getAllSavedBranches: "savedSet:getAllSavedBranches",
    getAllSavedScreenshotSets: "savedSet:getAllSavedScreenshotSets",
    getAllSavedSets: "savedSet:getAllSavedSets",
    getSavedScreenshotMetadata: "savedSet:getSavedScreenshotMetadata",
    getSavedComparisonMetadata: "savedSet:getSavedComparisonMetadata",
    deleteScreenshotSet: "savedSet:deleteScreenshotSet",
    deleteComparisonSet: "savedSet:deleteComparisonSet",
    deleteScreenshotBranch: "savedSet:deleteScreenshotBranch",
    deleteProject: "savedSet:deleteProject",
  },
};
