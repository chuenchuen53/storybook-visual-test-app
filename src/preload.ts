import { contextBridge, ipcRenderer } from "electron";
import type { SaveScreenshotType } from "./interface";

contextBridge.exposeInMainWorld("imgApi", {
  getScreenshotImg: (id: string) => ipcRenderer.invoke("img:getScreenshotImg", id),
  getCompareAddedImg: (id: string) => ipcRenderer.invoke("img:getCompareAddImg", id),
  getCompareRemovedImg: (id: string) => ipcRenderer.invoke("img:getCompareRemovedImg", id),
  getCompareDiffImg: (id: string) => ipcRenderer.invoke("img:getCompareDiffImg", id),
  getSavedImg: (type: SaveScreenshotType, project: string, branch: string, uuid: string, id: string) =>
    ipcRenderer.invoke("img:getSavedImg", type, project, branch, uuid, id),
});

contextBridge.exposeInMainWorld("screenshotApi", {
  getLocalIPAddress: () => ipcRenderer.invoke("screenshot:getLocalIPAddress"),
  startScreenshot: (url: string) => ipcRenderer.invoke("screenshot:startScreenshot", url),
  onReceiveScreenshotInfo: (callback: (params: any) => void) =>
    ipcRenderer.on("screenshot:info", (_event, params) => callback(params)),
  openInExplorer: () => ipcRenderer.send("screenshot:openInExplorer"),
  saveScreenshot: (project: string, branch: string, type: SaveScreenshotType) =>
    ipcRenderer.invoke("screenshot:save", project, branch, type),
});

contextBridge.exposeInMainWorld("compareApi", {
  getAvailableProjects: () => ipcRenderer.invoke("compare:getAvailableProjects"),
  getAvailableSets: (projectName: string) => ipcRenderer.invoke("compare:getAvailableSets", projectName),
  compare: (relativeRefDir: string, relativeTestDir: string) =>
    ipcRenderer.invoke("compare:compare", relativeRefDir, relativeTestDir),
  openInExplorer: () => ipcRenderer.send("compare:openInExplorer"),
  saveComparisonResult: () => ipcRenderer.invoke("compare:saveComparisonResult"),
});
