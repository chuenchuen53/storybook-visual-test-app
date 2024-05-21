import path from "path";
import { app, BrowserWindow, ipcMain } from "electron";
import { getAllFolders, openInExplorer } from "./main/utils";
import { MainWindowHelper } from "./MainWindowHelper";
import { ScreenshotServiceImpl } from "./main/service/ScreenshotServiceImpl";
import { compareDir, savedReferenceDir, savedTestDir, screenshotDir } from "./main/Filepath";
import { CompareServiceImpl } from "./main/service/CompareServiceImpl";
import { logger } from "./main/logger";
import { ImgServiceImpl } from "./main/service/ImgServiceImpl";
import type { CompareService } from "./main/service/CompareService";
import type { ScreenshotService } from "./main/service/ScreenshotService";
import type { SavedScreenshotResponse, SaveScreenshotType } from "./interface";
import type { ImgService } from "./main/service/ImgService";

logger.info("app start");

const screenshotService: ScreenshotService = ScreenshotServiceImpl.getInstance();
const compareServiceImpl: CompareService = CompareServiceImpl.getInstance();
const imgService: ImgService = ImgServiceImpl.getInstance();

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

  MainWindowHelper.registerMainWindow(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  ipcMain.handle("screenshot:getLocalIPAddress", () => screenshotService.getLocalIPAddress());
  ipcMain.handle("screenshot:startScreenshot", (_event, url: string) => {
    void screenshotService.newScreenshotSet(url);
  });

  ipcMain.on("screenshot:openInExplorer", () => {
    openInExplorer(screenshotDir);
  });

  ipcMain.handle(
    "screenshot:save",
    async (_event, project: string, branch: string, type: SaveScreenshotType): Promise<SavedScreenshotResponse> => {
      return await screenshotService.saveScreenshot(project, branch, type);
    },
  );

  ipcMain.handle("compare:getAvailableProjects", async () => {
    return await compareServiceImpl.getAvailableProjects();
  });

  ipcMain.handle("compare:getAvailableSets", async (_event, projectName: string) => {
    return await compareServiceImpl.getAvailableSets(projectName);
  });

  ipcMain.handle("compare:compare", async (_event, relativeRefDir: string, relativeTestDir: string) => {
    const refDir = path.join(savedReferenceDir, relativeRefDir);
    const testDir = path.join(savedTestDir, relativeTestDir);
    return await compareServiceImpl.compare(refDir, testDir);
  });

  ipcMain.handle("compare:saveComparisonResult", async () => {
    return await compareServiceImpl.saveComparison();
  });

  ipcMain.on("compare:openInExplorer", () => {
    openInExplorer(compareDir);
  });

  ipcMain.handle("img:getScreenshotImg", async (_event, id: string) => {
    return await imgService.getScreenshotImg(id);
  });

  ipcMain.handle("img:getCompareAddImg", async (_event, id: string) => {
    return await imgService.getCompareAddedImg(id);
  });

  ipcMain.handle("img:getCompareRemovedImg", async (_event, id: string) => {
    return await imgService.getCompareRemovedImg(id);
  });

  ipcMain.handle("img:getCompareDiffImg", async (_event, id: string) => {
    return await imgService.getCompareDiffImg(id);
  });

  ipcMain.handle(
    "img:getSavedImg",
    async (_event, type: SaveScreenshotType, project: string, branch: string, uuid: string, id: string) => {
      return await imgService.getSavedImg(type, project, branch, uuid, id);
    },
  );

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

process.on("uncaughtException", err => {
  logger.fatal(err, "uncaught exception detected");
});
