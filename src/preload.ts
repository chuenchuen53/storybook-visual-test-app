import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("screenshotApi", {
  getLocalIPAddress: () => ipcRenderer.invoke("screenshot:getLocalIPAddress"),
  startScreenshot: (url: string) => ipcRenderer.invoke("screenshot:startScreenshot", url),
  onReceiveScreenshotInfo: (callback: (params: any) => void) =>
    ipcRenderer.on("screenshot:info", (_event, params) => callback(params)),
});
