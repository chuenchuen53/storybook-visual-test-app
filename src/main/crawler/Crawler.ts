import type { StoryMetadata, StoryState, Viewport } from "../../shared/type";
import type { GetStoriesMetadataResult, ScreenshotStoriesResult } from "./type";

export interface Crawler {
  getStoriesMetadata(storybookUrl: string, onStartComputeMetadata: () => void): Promise<GetStoriesMetadataResult>;

  screenshotStories(
    storybookUrl: string,
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    concurrency: number,
    onStartScreenshot: () => void,
    onStoryStateChange: (storyId: string, state: StoryState, workerName: string, storyErr: boolean | null) => void,
  ): Promise<ScreenshotStoriesResult>;
}
