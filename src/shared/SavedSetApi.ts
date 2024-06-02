import type {
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteRefTestBranchRequest,
  DeleteRefTestSetRequest,
  OpenComparisonSetInExplorerRequest,
  OpenTestRefSetInExplorerRequest,
  GetAllSavedSetsResponse,
  GetAllSavedRefTestSetsResponse,
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
    deleteRefTestSet: "savedSet:deleteRefTestSet",
    deleteComparisonSet: "savedSet:deleteComparisonSet",
    deleteRefTestBranch: "savedSet:deleteRefTestBranch",
    deleteProject: "savedSet:deleteProject",
  },
};
