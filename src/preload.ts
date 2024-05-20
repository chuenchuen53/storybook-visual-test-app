import { contextBridge, ipcRenderer } from "electron";
import type { SaveScreenshotType } from "./interface";

contextBridge.exposeInMainWorld("imgApi", {
  getScreenshotImg: (id: string) => ipcRenderer.invoke("img:getScreenshotImg", id),
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
