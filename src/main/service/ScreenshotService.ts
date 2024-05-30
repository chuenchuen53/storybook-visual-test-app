import type { SavedScreenshotResponse, SaveScreenshotType, Viewport } from "../../shared/type";

export interface ScreenshotService {
  getLocalIPAddress(): string | undefined;
  newScreenshotSet(storybookUrl: string, viewport: Viewport, concurrency: number): Promise<void>;
  saveScreenshot(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    name: string,
  ): Promise<SavedScreenshotResponse>;
}
