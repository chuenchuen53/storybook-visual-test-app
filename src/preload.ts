import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("screenshotApi", {
  getLocalIPAddress: () => ipcRenderer.invoke("screenshot:getLocalIPAddress"),
  startScreenshot: (url: string) => ipcRenderer.invoke("screenshot:startScreenshot", url),
});
