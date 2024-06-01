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
    getScreenshotImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getScreenshotImg, id),
    getCompareAddedImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getCompareAddedImg, id),
    getCompareRemovedImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getCompareRemovedImg, id),
    getCompareDiffImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getCompareDiffImg, id),
    getSavedRefTestImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedRefTestImg, req),
    getSavedComparisonImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedComparisonImg, req),
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
    startScreenshot: req => ipcRenderer.send(ScreenshotChannelKey.send.startScreenshot, req),
  },
  invoke: {
    getLocalIPAddress: () => ipcRenderer.invoke(ScreenshotChannelKey.invoke.getLocalIPAddress),
    saveScreenshot: req => ipcRenderer.invoke(ScreenshotChannelKey.invoke.saveScreenshot, req),
  },
};

const comparisonApi: IpcRendererHandler<ComparisonApi> = {
  listen: {},
  send: {
    openInExplorer: () => ipcRenderer.send(ComparisonChannelKey.send.openInExplorer),
  },
  invoke: {
    getAvailableSets: project => ipcRenderer.invoke(ComparisonChannelKey.invoke.getAvailableSets, project),
    compare: req => ipcRenderer.invoke(ComparisonChannelKey.invoke.compare, req),
    saveComparisonResult: name => ipcRenderer.invoke(ComparisonChannelKey.invoke.saveComparisonResult, name),
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
    getAllSavedSets: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedSets, project),
    getRefOrTestSavedSetMetadata: req =>
      ipcRenderer.invoke(SavedSetChannelKey.invoke.getRefOrTestSavedSetMetadata, req),
    getComparisonSavedSetMetadata: req =>
      ipcRenderer.invoke(SavedSetChannelKey.invoke.getComparisonSavedSetMetadata, req),
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
