import path from "path";
import { app, BrowserWindow } from "electron";
import { MainWindow } from "./MainWindow";
import { ScreenshotServiceImpl } from "./main/service/ScreenshotServiceImpl";
import { CompareServiceImpl } from "./main/service/CompareServiceImpl";
import { logger } from "./main/logger";
import { ImgServiceImpl } from "./main/service/ImgServiceImpl";
import { registerScreenshotHandlers } from "./main/ipc-handlers/screenshot-handlers";
import { registerCompareHandlers } from "./main/ipc-handlers/compare-handlers";
import { registerImgHandlers } from "./main/ipc-handlers/img-handlers";
import { DockerContainer } from "./main/docker-helper/DockerContainer";
import type { CompareService } from "./main/service/CompareService";
import type { ScreenshotService } from "./main/service/ScreenshotService";
import type { ImgService } from "./main/service/ImgService";

logger.info("app start");

const imgService: ImgService = ImgServiceImpl.getInstance();
const screenshotService: ScreenshotService = ScreenshotServiceImpl.getInstance();
const compareService: CompareService = CompareServiceImpl.getInstance();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
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
  registerImgHandlers(imgService);
  registerScreenshotHandlers(screenshotService);
  registerCompareHandlers(compareService);
  void DockerContainer.ensureAllStopped();

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

app.on("before-quit", async event => {
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
