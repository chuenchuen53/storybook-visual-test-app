import os from "os";
import path from "path";
import fs from "fs-extra";

const home = os.homedir();
const rootDir = path.join(home, "visual-test-app");

const screenshotDir = path.join(rootDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

fs.ensureDirSync(screenshotDir);

export { screenshotDir, screenshotMetadataFilename };
