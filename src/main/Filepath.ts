import os from "os";
import path from "path";
import type { SaveScreenshotType } from "../shared/type";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const tempDir = path.join(appDataRootDir, "temp");
const savedDir = path.join(appDataRootDir, "saved");

const appLogFilepath = path.join(tempDir, "app.log");

const screenshotDir = path.join(tempDir, "screenshots");
const screenshotMetadataFilename = "metadata.json";

const comparisonDir = path.join(tempDir, "comparison");
const comparisonDiffDirName = "diff";
const comparisonDiffDir = path.join(comparisonDir, comparisonDiffDirName);
const comparisonMetadataFilename = "metadata.json";

const savedReferenceDir = path.join(savedDir, "reference");
const savedTestDir = path.join(savedDir, "test");
const savedComparisonDir = path.join(savedDir, "comparison");

const userSettingFilepath = path.join(appDataRootDir, "user-setting.json");

export class FilepathHelper {
  public static appLogPath(): string {
    return appLogFilepath;
  }

  public static tempScreenshotDir(): string {
    return screenshotDir;
  }

  public static tempScreenshotImgPath(imgFilename: string): string {
    return path.join(screenshotDir, imgFilename);
  }

  public static tempScreenshotMetadataPath(): string {
    return path.join(screenshotDir, screenshotMetadataFilename);
  }

  public static tempComparisonDir(): string {
    return comparisonDir;
  }

  public static tempComparisonDiffDir(): string {
    return comparisonDiffDir;
  }

  public static tempComparisonDiffImgPath(imgFilename: string): string {
    return path.join(comparisonDiffDir, imgFilename);
  }

  public static tempComparisonMetadataPath(): string {
    return path.join(comparisonDir, comparisonMetadataFilename);
  }

  public static savedRefDir(): string {
    return savedReferenceDir;
  }

  public static savedTestDir(): string {
    return savedTestDir;
  }

  public static savedRefTestProjectDir(type: SaveScreenshotType, project: string): string {
    switch (type) {
      case "reference":
        return path.join(savedReferenceDir, project);
      case "test":
        return path.join(savedTestDir, project);
    }
  }

  public static savedRefTestBranchDir(type: SaveScreenshotType, project: string, branch: string): string {
    return path.join(this.savedRefTestProjectDir(type, project), branch);
  }

  public static savedRefTestSetDir(type: SaveScreenshotType, project: string, branch: string, setId: string): string {
    return path.join(this.savedRefTestBranchDir(type, project, branch), setId);
  }

  public static savedRefTestImgPath(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
    imgFilename: string,
  ): string {
    return path.join(this.savedRefTestSetDir(type, project, branch, setId), imgFilename);
  }

  public static savedRefTestMetadataPath(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
  ): string {
    return path.join(this.savedRefTestSetDir(type, project, branch, setId), screenshotMetadataFilename);
  }

  public static savedScreenshotMetadataFilename(): string {
    return screenshotMetadataFilename;
  }

  public static savedComparisonProjectDir(project: string): string {
    return path.join(savedComparisonDir, project);
  }

  public static savedComparisonSetDir(project: string, setId: string): string {
    return path.join(this.savedComparisonProjectDir(project), setId);
  }

  public static savedComparisonDiffImgPath(project: string, setId: string, imgFilename: string): string {
    return path.join(this.savedComparisonSetDir(project, setId), comparisonDiffDirName, imgFilename);
  }

  public static savedComparisonMetadataPath(project: string, setId: string): string {
    return path.join(this.savedComparisonSetDir(project, setId), comparisonMetadataFilename);
  }

  public static userSettingPath(): string {
    return userSettingFilepath;
  }
}
