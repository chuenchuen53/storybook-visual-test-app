import type { SaveScreenshotResponse, SaveScreenshotType, Viewport } from "../../shared/type";

export interface ScreenshotService {
  getLocalIPAddress(): string | undefined;
  createNewSet(storybookUrl: string, viewport: Viewport, concurrency: number): Promise<void>;
  save(type: SaveScreenshotType, project: string, branch: string, name: string): Promise<SaveScreenshotResponse>;
}
