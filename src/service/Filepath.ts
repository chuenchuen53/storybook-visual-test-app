import os from "os";
import path from "path";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const tempDir = path.join(appDataRootDir, "temp");
const savedDir = path.join(appDataRootDir, "saved");

const screenshotDir = path.join(tempDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

const compareDir = path.join(tempDir, "compare");
const diffImgFolder = "diff";
const removedImgFolder = "removed";
const addedImgFolder = "added";
const compareMetadataFilename = "metadata.json";

const savedReferenceDir = path.join(savedDir, "reference");
const savedTestDir = path.join(savedDir, "test");
const savedInfoFilename = "saved-info.json";

export {
  appDataRootDir,
  screenshotDir,
  screenshotMetadataFilename,
  savedReferenceDir,
  savedTestDir,
  savedInfoFilename,
  compareDir,
  compareMetadataFilename,
  diffImgFolder,
  removedImgFolder,
  addedImgFolder,
};
