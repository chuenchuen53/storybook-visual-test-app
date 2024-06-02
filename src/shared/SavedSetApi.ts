import type {
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteRefTestBranchRequest,
  DeleteRefTestSetRequest,
  OpenComparisonSetInExplorerRequest,
  OpenTestRefSetInExplorerRequest,
  GetAllSavedSetsResponse,
  GetAllSavedRefTestSetsResponse,
  GetComparisonSavedSetMetadataRequest,
  GetComparisonSavedSetMetadataResponse,
  StoryMetadataWithRenderStatus,
  GetRefTestSavedSetMetadataRequest,
} from "./type";
import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface SavedSetApi extends IpcApi {
  listen: Record<string, never>;
  send: {
    openTestRefSetInExplorer: (req: OpenTestRefSetInExplorerRequest) => void;
    openComparisonSetInExplorer: (req: OpenComparisonSetInExplorerRequest) => void;
  };
  invoke: {
    getAllSavedProjects: () => Promise<string[]>;
    getAllSavedRefTestSets: (project: string) => Promise<GetAllSavedRefTestSetsResponse>;
    getAllSavedSets: (project: string) => Promise<GetAllSavedSetsResponse>;
    getRefTestSavedSetMetadata: (req: GetRefTestSavedSetMetadataRequest) => Promise<StoryMetadataWithRenderStatus[]>;
    getComparisonSavedSetMetadata: (
      req: GetComparisonSavedSetMetadataRequest,
    ) => Promise<GetComparisonSavedSetMetadataResponse>;
    deleteRefTestSet: (req: DeleteRefTestSetRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteComparisonSet: (req: DeleteComparisonSetRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteRefTestBranch: (req: DeleteRefTestBranchRequest) => Promise<GetAllSavedSetsResponse | null>;
    deleteProject: (req: DeleteProjectRequest) => Promise<boolean>;
  };
}

export const SavedSetChannelKey: IpcChannel<SavedSetApi> = {
  listen: {},
  send: {
    openTestRefSetInExplorer: "savedSet:openTestRefSetInExplorer",
    openComparisonSetInExplorer: "savedSet:openComparisonSetInExplorer",
  },
  invoke: {
    getAllSavedProjects: "savedSet:getAllSavedProjects",
    getAllSavedRefTestSets: "savedSet:getAllSavedRefTestSets",
    getAllSavedSets: "savedSet:getAllSavedSets",
    getRefTestSavedSetMetadata: "savedSet:getRefTestSavedSetMetadata",
    getComparisonSavedSetMetadata: "savedSet:getComparisonSavedSetMetadata",
    deleteRefTestSet: "savedSet:deleteRefTestSet",
    deleteComparisonSet: "savedSet:deleteComparisonSet",
    deleteRefTestBranch: "savedSet:deleteRefTestBranch",
    deleteProject: "savedSet:deleteProject",
  },
};
