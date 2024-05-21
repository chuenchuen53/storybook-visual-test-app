import type { StoryMetadata, Viewport } from "../../shared/typing";

export interface GetStoriesMetadataResult {
  success: boolean;
  storyMetadataList: StoryMetadata[] | null;
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
