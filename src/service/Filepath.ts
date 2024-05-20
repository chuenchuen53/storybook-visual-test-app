import os from "os";
import path from "path";
import fs from "fs-extra";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const screenshotDir = path.join(appDataRootDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

const savedReferenceDir = path.join(appDataRootDir, "reference");
const savedTestDir = path.join(appDataRootDir, "test");

const savedInfoFilename = "saved-info.json";

fs.ensureDirSync(screenshotDir);

export {
  appDataRootDir,
  screenshotDir,
  screenshotMetadataFilename,
  savedReferenceDir,
  savedTestDir,
  savedInfoFilename,
};
