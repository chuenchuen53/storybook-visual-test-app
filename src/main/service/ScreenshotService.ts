import type { SavedScreenshotResponse, SaveScreenshotType } from "../../shared/type";

export interface ScreenshotService {
  getLocalIPAddress(): string | undefined;
  newScreenshotSet(url: string): Promise<void>;
  saveScreenshot(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    name: string,
  ): Promise<SavedScreenshotResponse>;
}
