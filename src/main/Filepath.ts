import os from "os";
import path from "path";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const tempDir = path.join(appDataRootDir, "temp");
const savedDir = path.join(appDataRootDir, "saved");

const appLogFilepath = path.join(tempDir, "app.log");

const screenshotDir = path.join(tempDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

const comparisonDir = path.join(tempDir, "comparison");
const comparisonDiffDir = path.join(comparisonDir, "diff");
const comparisonRemovedDir = path.join(comparisonDir, "removed");
const comparisonAddedDir = path.join(comparisonDir, "added");
const comparisonMetadataFilename = "metadata.json";

const savedReferenceDir = path.join(savedDir, "reference");
const savedTestDir = path.join(savedDir, "test");
const savedComparisonDir = path.join(savedDir, "comparison");

const userSettingFilepath = path.join(appDataRootDir, "user-setting.json");

export {
  appLogFilepath,
  screenshotDir,
  screenshotMetadataFilename,
  comparisonDir,
  comparisonDiffDir,
  comparisonRemovedDir,
  comparisonAddedDir,
  comparisonMetadataFilename,
  savedReferenceDir,
  savedTestDir,
  savedComparisonDir,
  userSettingFilepath,
};
