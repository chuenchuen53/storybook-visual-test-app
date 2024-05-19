export interface StoryMetadata {
  id: string;
  componentId: string;
  title: string;
  kind: string;
  tags: string[];
  name: string;
  story: string;
}

export interface GetStoriesMetadataResult {
  success: boolean;
  storyMetadataList: StoryMetadata[] | null;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface StoryScreenshotMetadata extends StoryMetadata {
  storyErr: boolean;
}

export interface SavedMetadata {
  uuid: string;
  createAt: string;
  viewport: Viewport;
  storyMetadataList: StoryScreenshotMetadata[];
}

export interface ScreenshotStoriesResult {
  success: boolean;
  data: SavedMetadata | null;
}

export enum StoryState {
  WAITING = "WAITING",
  CAPTURING = "CAPTURING",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export interface Crawler {
  getStoriesMetadata(
    storybookUrl: string,
    onStartingBrowser: () => void,
    onComputingMetadata: () => void,
    onError: (errorMsg: string) => void,
  ): Promise<GetStoriesMetadataResult>;

  screenshotStories(
    storybookUrl: string,
    storyMetadataList: StoryMetadata[],
    viewport: Viewport,
    parallel: number,
    onStartScreenshot: () => void,
    onStoryStateChange: (storyId: string, state: StoryState, browserName: string, storyErr: boolean | null) => void,
  ): Promise<ScreenshotStoriesResult>;
}
