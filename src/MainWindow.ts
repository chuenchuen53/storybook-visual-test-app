import { logger } from "./main/logger";
import type { BrowserWindow } from "electron";

export class MainWindow {
  public static instance: BrowserWindow | null = null;

  public static registerMainWindow(x: BrowserWindow) {
    if (MainWindow.instance !== null) {
      logger.fatal("MainWindow has already been registered");
      throw new Error("MainWindow has already been registered");
    }
    MainWindow.instance = x;
  }

  public static send(channel: string, ...args: any[]) {
    if (MainWindow.instance === null) {
      logger.error("send is called before MainWindow registered");
    }
    MainWindow.instance.webContents.send(channel, ...args);
  }
}
