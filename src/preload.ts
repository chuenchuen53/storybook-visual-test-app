import { contextBridge, ipcRenderer } from "electron";
import { ScreenshotChannelKey } from "./shared/ScreenshotApi";
import type { IpcRendererHandler } from "./shared/ipc-type-helper";
import type { ScreenshotApi } from "./shared/ScreenshotApi";
import type { GlobalMessage, SaveScreenshotType } from "./shared/type";

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
    startScreenshot: url => ipcRenderer.send(ScreenshotChannelKey.send.startScreenshot, url),
  },
  invoke: {
    getLocalIPAddress: () => ipcRenderer.invoke(ScreenshotChannelKey.invoke.getLocalIPAddress),
    saveScreenshot: req => ipcRenderer.invoke(ScreenshotChannelKey.invoke.saveScreenshot, req),
  },
};

contextBridge.exposeInMainWorld("globalApi", {
  onReceiveGlobalMessage: (cb: (msg: GlobalMessage) => void) =>
    ipcRenderer.on("global:message", (_event, msg) => cb(msg)),
});

contextBridge.exposeInMainWorld("imgApi", {
  getScreenshotImg: (id: string) => ipcRenderer.invoke("img:getScreenshotImg", id),
  getCompareAddedImg: (id: string) => ipcRenderer.invoke("img:getCompareAddImg", id),
  getCompareRemovedImg: (id: string) => ipcRenderer.invoke("img:getCompareRemovedImg", id),
  getCompareDiffImg: (id: string) => ipcRenderer.invoke("img:getCompareDiffImg", id),
  getSavedImg: (type: SaveScreenshotType, project: string, branch: string, uuid: string, id: string) =>
    ipcRenderer.invoke("img:getSavedImg", type, project, branch, uuid, id),
});

contextBridge.exposeInMainWorld("userSettingApi", {
  getProjectsInTab: () => ipcRenderer.invoke("userSetting:getProjectsInTab"),
  updateProjectsInTab: (projects: string[]) => ipcRenderer.invoke("userSetting:updateProjectsInTab", projects),
});

contextBridge.exposeInMainWorld("screenshotApi", screenshotApi);

contextBridge.exposeInMainWorld("compareApi", {
  openInExplorer: () => ipcRenderer.send("compare:openInExplorer"),
  getAvailableProjects: () => ipcRenderer.invoke("compare:getAvailableProjects"),
  getAvailableSets: (project: string) => ipcRenderer.invoke("compare:getAvailableSets", project),
  compare: (relativeRefDir: string, relativeTestDir: string) =>
    ipcRenderer.invoke("compare:compare", relativeRefDir, relativeTestDir),
  saveComparisonResult: () => ipcRenderer.invoke("compare:saveComparison"),
});

contextBridge.exposeInMainWorld("savedSetApi", {
  getAllRefOrTestBranches: (type: SaveScreenshotType, project: string) =>
    ipcRenderer.invoke("savedSet:getAllRefOrTestBranches", type, project),
  getAllRefOrTestSavedSets: (type: SaveScreenshotType, project: string, branch: string) =>
    ipcRenderer.invoke("savedSet:getAllRefOrTestSavedSets", type, project, branch),
  getAllSavedSets: (project: string) => ipcRenderer.invoke("savedSet:getAllSavedSets", project),
  getRefOrTestSavedSetMetadata: (type: SaveScreenshotType, project: string, branch: string, setId: string) =>
    ipcRenderer.invoke("savedSet:getRefOrTestSavedSetMetadata", type, project, branch, setId),
});
