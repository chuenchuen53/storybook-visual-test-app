import type {
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteRefTestBranchRequest,
  DeleteRefTestSetRequest,
  GetComparisonSavedSetMetadataRequest,
  GetComparisonSavedSetMetadataResponse,
  OpenComparisonSetInExplorerRequest,
  OpenTestRefSetInExplorerRequest,
  RetRefOrTestSavedSetMetadataRequest,
  SavedSets,
  StoryMetadataWithRenderStatus,
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
    getAllSavedSets: (project: string) => Promise<SavedSets>;
    getRefOrTestSavedSetMetadata: (
      req: RetRefOrTestSavedSetMetadataRequest,
    ) => Promise<StoryMetadataWithRenderStatus[]>;
    getComparisonSavedSetMetadata: (
      req: GetComparisonSavedSetMetadataRequest,
    ) => Promise<GetComparisonSavedSetMetadataResponse>;
    deleteRefTestSet: (req: DeleteRefTestSetRequest) => Promise<SavedSets | null>;
    deleteComparisonSet: (req: DeleteComparisonSetRequest) => Promise<SavedSets | null>;
    deleteRefTestBranch: (req: DeleteRefTestBranchRequest) => Promise<SavedSets | null>;
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
    getAllSavedSets: "savedSet:getAllSavedSets",
    getRefOrTestSavedSetMetadata: "savedSet:getRefOrTestSavedSetMetadata",
    getComparisonSavedSetMetadata: "savedSet:getComparisonSavedSetMetadata",
    deleteRefTestSet: "savedSet:deleteRefTestSet",
    deleteComparisonSet: "savedSet:deleteComparisonSet",
    deleteRefTestBranch: "savedSet:deleteRefTestBranch",
    deleteProject: "savedSet:deleteProject",
  },
};
