import { BrowserWindow } from "electron";
import type { SendScreenshotInfoParams } from "./typing";

export class MainWindowHelper extends BrowserWindow {
  private static instance: BrowserWindow | null = null;

  public static registerMainWindow(x: BrowserWindow) {
    if (MainWindowHelper.instance !== null) {
      // todo
      throw new Error("MainWindow has already been registered");
    }
    MainWindowHelper.instance = x;
  }

  public static sendScreenshotInfo(params: SendScreenshotInfoParams) {
    MainWindowHelper.send("screenshot:info", params);
  }

  private static send(channel: string, ...args: any[]) {
    if (MainWindowHelper.instance === null) {
      console.log("[WARN]: send is called before MainWindow registered");
    }
    MainWindowHelper.instance.webContents.send(channel, ...args);
  }
}
