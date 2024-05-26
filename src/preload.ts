import { contextBridge, ipcRenderer } from "electron";
import type { GlobalMessage, SaveScreenshotType, ScreenshotState, StoryMetadata, StoryState } from "./shared/type";

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

contextBridge.exposeInMainWorld("screenshotApi", {
  onUpdateStatus: (cb: (status: ScreenshotState) => void) =>
    ipcRenderer.on("screenshot:updateStatus", (_event, status) => cb(status)),
  onNewMetadata: (cb: (storyMetadataList: StoryMetadata[]) => void) =>
    ipcRenderer.on("screenshot:newMetadata", (_event, storyMetadataList) => cb(storyMetadataList)),
  onUpdateStoryState: (
    cb: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ) =>
    ipcRenderer.on("screenshot:updateStoryState", (_event, storyId, state, browserName, storyErr) =>
      cb(storyId, state, browserName, storyErr),
    ),

  openInExplorer: () => ipcRenderer.send("screenshot:openInExplorer"),
  getLocalIPAddress: () => ipcRenderer.invoke("screenshot:getLocalIPAddress"),
  startScreenshot: (url: string) => ipcRenderer.invoke("screenshot:startScreenshot", url),
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) =>
    ipcRenderer.invoke("screenshot:save", project, branch, type),
});

contextBridge.exposeInMainWorld("compareApi", {
  openInExplorer: () => ipcRenderer.send("compare:openInExplorer"),
  getAvailableProjects: () => ipcRenderer.invoke("compare:getAvailableProjects"),
  getAvailableSets: (project: string) => ipcRenderer.invoke("compare:getAvailableSets", project),
  compare: (relativeRefDir: string, relativeTestDir: string) =>
    ipcRenderer.invoke("compare:compare", relativeRefDir, relativeTestDir),
  saveComparisonResult: () => ipcRenderer.invoke("compare:saveComparison"),
});
