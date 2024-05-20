import path from "path";
import fs from "fs-extra";
import { app, BrowserWindow, ipcMain } from "electron";
import { getLocalIPAddress, openInExplorer } from "./service/utils";
import { MainWindowHelper } from "./MainWindowHelper";
import { screenshotService } from "./service/screenshot-service";
import { appDataRootDir, savedInfoFilename, savedReferenceDir, savedTestDir, screenshotDir } from "./service/Filepath";
import type { SavedScreenshotResponse, SaveScreenshotType } from "./interface";

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
  ipcMain.handle("img:getScreenshotImg", (_event, id: string) => {
    const filepath = screenshotDir + "/" + id + ".png";
    const isExist = fs.existsSync(filepath);
    const base64 = isExist ? fs.readFileSync(filepath).toString("base64") : null;
    return { base64, isExist };
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
