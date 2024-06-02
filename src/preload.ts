import { contextBridge, ipcRenderer } from "electron";
import { ScreenshotChannelKey } from "./shared/ScreenshotApi";
import { ComparisonChannelKey } from "./shared/ComparisonApi";
import { SavedSetChannelKey } from "./shared/SavedSetApi";
import { ImgChannelKey } from "./shared/ImgApi";
import { GlobalChannelKey } from "./shared/GlobalApi";
import { UserSettingChannelKey } from "./shared/UserSettingApi";
import type { UserSettingApi } from "./shared/UserSettingApi";
import type { GlobalApi } from "./shared/GlobalApi";
import type { ImgApi } from "./shared/ImgApi";
import type { SavedSetApi } from "./shared/SavedSetApi";
import type { ComparisonApi } from "./shared/ComparisonApi";
import type { IpcRendererHandler } from "./shared/ipc-type-helper";
import type { ScreenshotApi } from "./shared/ScreenshotApi";

const globalApi: IpcRendererHandler<GlobalApi> = {
  listen: {
    onReceiveGlobalMessage: cb =>
      ipcRenderer.on(GlobalChannelKey.listen.onReceiveGlobalMessage, (_event, msg: Parameters<typeof cb>[0]) =>
        cb(msg),
      ),
  },
  send: {},
  invoke: {},
};

const userSettingApi: IpcRendererHandler<UserSettingApi> = {
  listen: {},
  send: {},
  invoke: {
    getProjectsInTab: () => ipcRenderer.invoke(UserSettingChannelKey.invoke.getProjectsInTab),
    updateProjectsInTab: projects => ipcRenderer.invoke(UserSettingChannelKey.invoke.updateProjectsInTab, projects),
  },
};

const imgApi: IpcRendererHandler<ImgApi> = {
  listen: {},
  send: {},
  invoke: {
    getTempScreenshotImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getTempScreenshotImg, id),
    getTempComparisonDiffImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getTempComparisonDiffImg, id),
    getSavedRefTestImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedRefTestImg, req),
    getSavedComparisonDiffImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedComparisonDiffImg, req),
  },
};

const screenshotApi: IpcRendererHandler<ScreenshotApi> = {
  listen: {
    onUpdateStatus: cb =>
      ipcRenderer.on(ScreenshotChannelKey.listen.onUpdateStatus, (_, status: Parameters<typeof cb>[0]) => cb(status)),
    onNewMetadata: cb =>
      ipcRenderer.on(ScreenshotChannelKey.listen.onNewMetadata, (_, storyMetadataList: Parameters<typeof cb>[0]) =>
        cb(storyMetadataList),
      ),
    onUpdateStoryState: cb =>
      ipcRenderer.on(ScreenshotChannelKey.listen.onUpdateStoryState, (_, data: Parameters<typeof cb>[0]) => cb(data)),
  },
  send: {
    openInExplorer: () => ipcRenderer.send(ScreenshotChannelKey.send.openInExplorer),
    createNewSet: req => ipcRenderer.send(ScreenshotChannelKey.send.createNewSet, req),
  },
  invoke: {
    getLocalIPAddress: () => ipcRenderer.invoke(ScreenshotChannelKey.invoke.getLocalIPAddress),
    save: req => ipcRenderer.invoke(ScreenshotChannelKey.invoke.save, req),
  },
};

const comparisonApi: IpcRendererHandler<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: () => ipcRenderer.send(ComparisonChannelKey.send.openInExplorer),
  },
  invoke: {
    compare: req => ipcRenderer.invoke(ComparisonChannelKey.invoke.compare, req),
    save: name => ipcRenderer.invoke(ComparisonChannelKey.invoke.save, name),
  },
};

const savedSetApi: IpcRendererHandler<SavedSetApi> = {
  listen: {},
  send: {
    openTestRefSetInExplorer: req => ipcRenderer.send(SavedSetChannelKey.send.openTestRefSetInExplorer, req),
    openComparisonSetInExplorer: req => ipcRenderer.send(SavedSetChannelKey.send.openComparisonSetInExplorer, req),
  },
  invoke: {
    getAllSavedProjects: () => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedProjects),
    getAllSavedRefTestSets: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedRefTestSets, project),
    getAllSavedSets: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedSets, project),
    deleteRefTestSet: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteRefTestSet, req),
    deleteComparisonSet: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteComparisonSet, req),
    deleteRefTestBranch: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteRefTestBranch, req),
    deleteProject: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteProject, project),
  },
};

contextBridge.exposeInMainWorld("globalApi", globalApi);
contextBridge.exposeInMainWorld("userSettingApi", userSettingApi);
contextBridge.exposeInMainWorld("imgApi", imgApi);
contextBridge.exposeInMainWorld("screenshotApi", screenshotApi);
contextBridge.exposeInMainWorld("comparisonApi", comparisonApi);
contextBridge.exposeInMainWorld("savedSetApi", savedSetApi);
