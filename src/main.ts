import path from "path";
import process from "node:process";
import { app, BrowserWindow } from "electron";
import { registerUserSettingHandlers } from "./main/ipc-handlers/user-setting-handlers";
import { UserSettingServiceImpl } from "./main/service/UserSettingServiceImpl";
import { MainWindow } from "./main/MainWindow";
import { ScreenshotServiceImpl } from "./main/service/ScreenshotServiceImpl";
import { ComparisonServiceImpl } from "./main/service/ComparisonServiceImpl";
import { logger } from "./main/logger";
import { ImgServiceImpl } from "./main/service/ImgServiceImpl";
import { registerScreenshotHandlers } from "./main/ipc-handlers/screenshot-handlers";
import { registerComparisonHandlers } from "./main/ipc-handlers/comparison-handlers";
import { registerImgHandlers } from "./main/ipc-handlers/img-handlers";
import { registerSavedSetHandlers } from "./main/ipc-handlers/saved-set-handler";
import { DockerContainer } from "./main/docker-helper/DockerContainer";
import { SavedSetServiceImpl } from "./main/service/SavedSetServiceImpl";
import { isDockerAvailable } from "./main/docker-helper/is-docker-available";
import fixPath from "./main/fix-path";
import type { SavedSetService } from "./main/service/SavedSetService";
import type { UserSettingService } from "./main/service/UserSettingService";
import type { ComparisonService } from "./main/service/ComparisonService";
import type { ScreenshotService } from "./main/service/ScreenshotService";
import type { ImgService } from "./main/service/ImgService";

fixPath();

logger.info("app start");

const userSettingService: UserSettingService = UserSettingServiceImpl.getInstance();
const imgService: ImgService = ImgServiceImpl.getInstance();
const screenshotService: ScreenshotService = ScreenshotServiceImpl.getInstance();
const comparisonService: ComparisonService = ComparisonServiceImpl.getInstance();
const savedSetService: SavedSetService = SavedSetServiceImpl.getInstance();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  MainWindow.registerMainWindow(mainWindow);

  mainWindow.on("closed", () => {
    MainWindow.unregisterMainWindow();
  });
};

app.on("ready", () => {
  if (MainWindow.getMainWindow() !== null) {
    logger.info("MainWindow has already been registered");
    MainWindow.getMainWindow()?.focus();
    return;
  }

  registerImgHandlers(imgService);
  registerUserSettingHandlers(userSettingService);
  registerScreenshotHandlers(screenshotService);
  registerComparisonHandlers(comparisonService);
  registerSavedSetHandlers(savedSetService);

  if (isDockerAvailable()) void DockerContainer.ensureAllStopped();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async () => {
  await DockerContainer.ensureAllStopped();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async _event => {
  logger.info("app quit");
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on("uncaughtException", err => {
  logger.fatal(err, "uncaught exception detected");
});
