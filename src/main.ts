import path from "path";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain } from "electron";
import { getAllFolders, getLocalIPAddress, openInExplorer } from "./main/utils";
import { MainWindowHelper } from "./MainWindowHelper";
import { screenshotService } from "./main/screenshot-service";
import {
  compareAddedDir,
  compareDiffDir,
  compareDir,
  compareMetadataFilename,
  compareRemovedDir,
  savedComparisonDir,
  savedInfoFilename,
  savedReferenceDir,
  savedTestDir,
  screenshotDir,
  screenshotMetadataFilename,
} from "./main/Filepath";
import { compareService } from "./main/compare-service";
import { logger } from "./main/logger";
import type {
  CompareResponse,
  GetAvailableSetResponse,
  GetImgResponse,
  SavedScreenshotResponse,
  SaveScreenshotType,
  SetData,
} from "./interface";

logger.info("app start");

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
  ipcMain.handle("screenshot:getLocalIPAddress", () => getLocalIPAddress());
  ipcMain.handle("screenshot:startScreenshot", (_event, url: string) => {
    screenshotService(url);
  });

  ipcMain.on("screenshot:openInExplorer", () => {
    openInExplorer(screenshotDir);
  });
  ipcMain.handle(
    "screenshot:save",
    async (_event, project: string, branch: string, type: SaveScreenshotType): Promise<SavedScreenshotResponse> => {
      try {
        const srcDir = screenshotDir;

        const metadata = await fs.readJSON(path.join(srcDir, "metadata.json"));
        const uuid = metadata.uuid;

        const typeDir = type === "reference" ? savedReferenceDir : savedTestDir;
        const destDir = path.join(typeDir, project, branch, uuid);
        await fs.ensureDir(destDir);
        await fs.copy(srcDir, destDir, { overwrite: true });
        const savedInfo = {
          uuid,
          type,
          project,
          branch,
        };
        const savedInfoPath = path.join(destDir, savedInfoFilename);
        await fs.writeJson(savedInfoPath, savedInfo);
        return { success: true };
      } catch (e) {
        console.error(e);
        return { success: false, errMsg: e.message };
      }
    },
  );

  ipcMain.handle("compare:getAvailableProjects", async () => {
    return getAllFolders(savedReferenceDir);
  });

  ipcMain.handle("compare:getAvailableSets", async (_event, projectName: string) => {
    const getSetsFromDir = async (dir: string): Promise<SetData[]> => {
      const branches = await getAllFolders(dir);
      return await Promise.all(
        branches.map(async branch => {
          const branchDir = path.join(dir, branch);
          const setList = await getAllFolders(branchDir);
          return {
            branch,
            setList: await Promise.all(
              setList.map(async uuid => {
                const metadata = await fs.readJSON(path.join(branchDir, uuid, screenshotMetadataFilename));
                return {
                  uuid,
                  createAt: metadata.createAt,
                  viewport: metadata.viewport,
                };
              }),
            ),
          };
        }),
      );
    };

    const result: GetAvailableSetResponse = {
      ref: [],
      test: [],
    };

    const refDir = path.join(savedReferenceDir, projectName);
    const testDir = path.join(savedTestDir, projectName);

    const refExists = await fs.pathExists(refDir);
    const testExists = await fs.pathExists(testDir);

    if (refExists) result.ref = await getSetsFromDir(refDir);
    if (testExists) result.test = await getSetsFromDir(testDir);

    return result;
  });

  ipcMain.handle("compare:compare", async (_event, relativeRefDir: string, relativeTestDir: string) => {
    const refDir = path.join(savedReferenceDir, relativeRefDir);
    const testDir = path.join(savedTestDir, relativeTestDir);
    const result: CompareResponse = await compareService(refDir, testDir);
    return result;
  });

  ipcMain.on("compare:openInExplorer", () => {
    openInExplorer(compareDir);
  });

  const getImg = async (filepath: string): Promise<GetImgResponse> => {
    const isExist = await fs.pathExists(filepath);
    const base64 = isExist ? fs.readFileSync(filepath).toString("base64") : null;
    return { base64, isExist };
  };

  ipcMain.handle("img:getScreenshotImg", async (_event, id: string) => {
    const filepath = path.join(screenshotDir, id + ".png");
    return await getImg(filepath);
  });

  ipcMain.handle("img:getCompareAddImg", async (_event, id: string) => {
    const filepath = path.join(compareAddedDir, id + ".png");
    return await getImg(filepath);
  });

  ipcMain.handle("img:getCompareRemovedImg", async (_event, id: string) => {
    const filepath = path.join(compareRemovedDir, id + ".png");
    console.log(filepath);
    return await getImg(filepath);
  });

  ipcMain.handle("img:getCompareDiffImg", async (_event, id: string) => {
    const filepath = path.join(compareDiffDir, id + ".png");
    return await getImg(filepath);
  });

  ipcMain.handle(
    "img:getSavedImg",
    async (_event, type: SaveScreenshotType, project: string, branch: string, uuid: string, id: string) => {
      const typeDir = type === "reference" ? savedReferenceDir : savedTestDir;
      const filepath = path.join(typeDir, project, branch, uuid, id + ".png");
      return await getImg(filepath);
    },
  );

  ipcMain.handle("compare:saveComparisonResult", async () => {
    try {
      const srcDir = compareDir;
      const metadata = await fs.readJSON(path.join(srcDir, compareMetadataFilename));
      const { uuid, project } = metadata;

      const destDir = path.join(savedComparisonDir, project, uuid);
      await fs.copy(srcDir, destDir, { overwrite: true });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, errMsg: e.message };
    }
  });

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
