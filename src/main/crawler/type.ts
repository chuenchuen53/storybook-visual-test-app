import type { SavedMetadata, StoryMetadata } from "../../shared/type";

export interface GetStoriesMetadataResult {
  success: boolean;
  storyMetadataList: StoryMetadata[] | null;
}

export interface ScreenshotStoriesResult {
  success: boolean;
  data: SavedMetadata | null;
}
