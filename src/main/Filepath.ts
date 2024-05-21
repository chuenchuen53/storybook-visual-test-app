import os from "os";
import path from "path";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const tempDir = path.join(appDataRootDir, "temp");
const savedDir = path.join(appDataRootDir, "saved");

const appLogFilepath = path.join(tempDir, "app.log");

const screenshotDir = path.join(tempDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

const compareDir = path.join(tempDir, "compare");
const compareDiffDir = path.join(compareDir, "diff");
const compareRemovedDir = path.join(compareDir, "removed");
const compareAddedDir = path.join(compareDir, "added");
const compareResultFilename = "result.json";
const compareMetadataFilename = "metadata.json";

const savedReferenceDir = path.join(savedDir, "reference");
const savedTestDir = path.join(savedDir, "test");
const savedComparisonDir = path.join(savedDir, "comparison");
const savedInfoFilename = "saved-info.json";

export {
  appLogFilepath,
  screenshotDir,
  screenshotMetadataFilename,
  compareDir,
  compareDiffDir,
  compareRemovedDir,
  compareAddedDir,
  compareResultFilename,
  compareMetadataFilename,
  savedReferenceDir,
  savedTestDir,
  savedInfoFilename,
  savedComparisonDir,
};
