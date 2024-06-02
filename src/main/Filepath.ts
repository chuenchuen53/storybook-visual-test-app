import os from "os";
import path from "path";

const home = os.homedir();
const appDataRootDir = path.join(home, "visual-test-app");

const tempDir = path.join(appDataRootDir, "temp");
const savedDir = path.join(appDataRootDir, "saved");

const appLogFilepath = path.join(tempDir, "app.log");

const screenshotDir = path.join(tempDir, "screenshot");
const screenshotMetadataFilename = "metadata.json";

const comparisonDir = path.join(tempDir, "comparison");
const comparisonDiffDirName = "diff";
const comparisonDiffDir = path.join(comparisonDir, comparisonDiffDirName);
const comparisonMetadataFilename = "metadata.json";

const savedScreenshotDir = path.join(savedDir, "screenshot");
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

  public static savedScreenshotDir(): string {
    return savedScreenshotDir;
  }

  public static savedScreenshotProjectDir(project: string): string {
    return path.join(savedScreenshotDir, project);
  }

  public static savedScreenshotBranchDir(project: string, branch: string): string {
    return path.join(this.savedScreenshotProjectDir(project), branch);
  }

  public static savedScreenshotSetDir(project: string, branch: string, setId: string): string {
    return path.join(this.savedScreenshotBranchDir(project, branch), setId);
  }

  public static savedScreenshotImgPath(project: string, branch: string, setId: string, imgFilename: string): string {
    return path.join(this.savedScreenshotSetDir(project, branch, setId), imgFilename);
  }

  public static savedScreenshotMetadataPath(project: string, branch: string, setId: string): string {
    return path.join(this.savedScreenshotSetDir(project, branch, setId), screenshotMetadataFilename);
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
