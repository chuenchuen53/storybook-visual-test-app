import { contextBridge, ipcRenderer } from "electron";
import { ScreenshotChannelKey } from "./shared/ScreenshotApi";
import { ComparisonChannelKey } from "./shared/ComparisonApi";
import { SavedSetChannelKey } from "./shared/SavedSetApi";
import { ImgChannelKey } from "./shared/ImgApi";
import { GlobalChannelKey } from "./shared/GlobalApi";
import { UserSettingChannelKey } from "./shared/UserSettingApi";
import type { FirstParamType, IpcRendererHandler } from "./shared/ipc-type-helper";
import type { UserSettingApi } from "./shared/UserSettingApi";
import type { GlobalApi } from "./shared/GlobalApi";
import type { ImgApi } from "./shared/ImgApi";
import type { SavedSetApi } from "./shared/SavedSetApi";
import type { ComparisonApi } from "./shared/ComparisonApi";
import type { ScreenshotApi } from "./shared/ScreenshotApi";

const globalApi: IpcRendererHandler<GlobalApi> = {
  listen: {
    onReceiveGlobalMessage: cb =>
      ipcRenderer.on(GlobalChannelKey.listen.onReceiveGlobalMessage, (_event, msg: FirstParamType<typeof cb>) =>
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
    getAppTheme: () => ipcRenderer.invoke(UserSettingChannelKey.invoke.getAppTheme),
    setAppTheme: theme => ipcRenderer.invoke(UserSettingChannelKey.invoke.setAppTheme, theme),
    getProjectsInTab: () => ipcRenderer.invoke(UserSettingChannelKey.invoke.getProjectsInTab),
    setProjectsInTab: projects => ipcRenderer.invoke(UserSettingChannelKey.invoke.setProjectsInTab, projects),
  },
};

const imgApi: IpcRendererHandler<ImgApi> = {
  listen: {},
  send: {},
  invoke: {
    getTempScreenshotImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getTempScreenshotImg, id),
    getTempComparisonDiffImg: id => ipcRenderer.invoke(ImgChannelKey.invoke.getTempComparisonDiffImg, id),
    getSavedScreenshotImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedScreenshotImg, req),
    getSavedComparisonDiffImg: req => ipcRenderer.invoke(ImgChannelKey.invoke.getSavedComparisonDiffImg, req),
  },
};

const screenshotApi: IpcRendererHandler<ScreenshotApi> = {
  listen: {
    onUpdateStatus: cb =>
      ipcRenderer.on(ScreenshotChannelKey.listen.onUpdateStatus, (_, status: FirstParamType<typeof cb>) => cb(status)),
    onNewMetadata: cb =>
      ipcRenderer.on(ScreenshotChannelKey.listen.onNewMetadata, (_, storyMetadataList: FirstParamType<typeof cb>) =>
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
    openScreenshotSetInExplorer: req => ipcRenderer.send(SavedSetChannelKey.send.openScreenshotSetInExplorer, req),
    openComparisonSetInExplorer: req => ipcRenderer.send(SavedSetChannelKey.send.openComparisonSetInExplorer, req),
  },
  invoke: {
    getAllSavedProjects: () => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedProjects),
    getAllSavedScreenshotSets: project =>
      ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedScreenshotSets, project),
    getAllSavedSets: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.getAllSavedSets, project),
    getSavedScreenshotMetadata: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.getSavedScreenshotMetadata, req),
    getSavedComparisonMetadata: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.getSavedComparisonMetadata, req),
    deleteScreenshotSet: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteScreenshotSet, req),
    deleteComparisonSet: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteComparisonSet, req),
    deleteScreenshotBranch: req => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteScreenshotBranch, req),
    deleteProject: project => ipcRenderer.invoke(SavedSetChannelKey.invoke.deleteProject, project),
  },
};

contextBridge.exposeInMainWorld("globalApi", globalApi);
contextBridge.exposeInMainWorld("userSettingApi", userSettingApi);
contextBridge.exposeInMainWorld("imgApi", imgApi);
contextBridge.exposeInMainWorld("screenshotApi", screenshotApi);
contextBridge.exposeInMainWorld("comparisonApi", comparisonApi);
contextBridge.exposeInMainWorld("savedSetApi", savedSetApi);
