import type {
  GetComparisonSavedSetMetadataRequest,
  GetComparisonSavedSetMetadataResponse,
  RetRefOrTestSavedSetMetadataRequest,
  SavedSets,
  StoryScreenshotMetadata,
} from "./type";
import type { IpcApi, IpcChannel } from "./ipc-type-helper";

export interface SavedSetApi extends IpcApi {
  listen: Record<string, never>;
  send: Record<string, never>;
  invoke: {
    getAllSavedProjects: () => Promise<string[]>;
    getAllSavedSets: (project: string) => Promise<SavedSets>;
    getRefOrTestSavedSetMetadata: (req: RetRefOrTestSavedSetMetadataRequest) => Promise<StoryScreenshotMetadata[]>;
    getComparisonSavedSetMetadata: (
      req: GetComparisonSavedSetMetadataRequest,
    ) => Promise<GetComparisonSavedSetMetadataResponse>;
  };
}

export const SavedSetChannelKey: IpcChannel<SavedSetApi> = {
  listen: {},
  send: {},
  invoke: {
    getAllSavedProjects: "savedSet:getAllSavedProjects",
    getAllSavedSets: "savedSet:getAllSavedSets",
    getRefOrTestSavedSetMetadata: "savedSet:getRefOrTestSavedSetMetadata",
    getComparisonSavedSetMetadata: "savedSet:getComparisonSavedSetMetadata",
  },
};
