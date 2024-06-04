import { logger } from "./logger";
import type { BrowserWindow } from "electron";

export class MainWindow {
  private static instance: BrowserWindow | null = null;

  public static getMainWindow(): BrowserWindow | null {
    return MainWindow.instance;
  }

  public static registerMainWindow(x: BrowserWindow) {
    if (MainWindow.instance !== null) {
      logger.fatal("MainWindow has already been registered");
      throw new Error("MainWindow has already been registered");
    }
    MainWindow.instance = x;
  }

  public static unregisterMainWindow() {
    if (MainWindow.instance === null) {
      logger.fatal("MainWindow has not been registered");
      throw new Error("MainWindow has not been registered");
    }
    MainWindow.instance = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static send(channel: string, ...args: any[]) {
    if (MainWindow.instance === null) {
      logger.error("send is called before MainWindow registered");
      return;
    }
    MainWindow.instance.webContents.send(channel, ...args);
  }
}
