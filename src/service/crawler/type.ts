export interface StoryScreenshot {
  id: string;
  timeSpent: number;
  storyErr: boolean;
}

export interface ScreenshotStoriesResult {
  success: boolean;
  viewport: { width: number; height: number };
  storyScreenshotList: StoryScreenshot[];
}

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
  storyMetadataList: StoryMetadata[];
}

export interface SavedStoryMetadata {
  id: string;
  componentId: string;
  title: string;
  kind: string;
  tags: string[];
  name: string;
  story: string;
  timeSpent: number;
  storyErr: boolean;
}

export interface SavedMetadata {
  createAt: string;
  storyMetadataList: SavedStoryMetadata[];
}

export interface Crawler {
  getStoriesMetadata(url: string): Promise<GetStoriesMetadataResult>;
  screenshotStories(
    url: string,
    storyMetadataList: StoryMetadata[],
    viewport: { width: number; height: number },
    parallel: number,
  ): Promise<ScreenshotStoriesResult>;
}
