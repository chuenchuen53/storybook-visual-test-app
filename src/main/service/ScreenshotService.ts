import type { SavedScreenshotResponse, SaveScreenshotType } from "../../interface";

export interface ScreenshotService {
  getLocalIPAddress(): string;
  newScreenshotSet(url: string): Promise<void>;
  saveScreenshot(project: string, branch: string, type: SaveScreenshotType): Promise<SavedScreenshotResponse>;
}
