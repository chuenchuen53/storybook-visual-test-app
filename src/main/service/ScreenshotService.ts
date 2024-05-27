import type { SavedScreenshotResponse, SaveScreenshotType } from "../../shared/type";

export interface ScreenshotService {
  getLocalIPAddress(): string | undefined;
  newScreenshotSet(url: string): Promise<void>;
  saveScreenshot(project: string, branch: string, type: SaveScreenshotType): Promise<SavedScreenshotResponse>;
}
