import type { StoryMetadata, StoryScreenshotMetadata } from "../../shared/type";

export interface GetStoriesMetadataResult {
  storyMetadataList: StoryMetadata[];
}

export interface ScreenshotStoriesResult {
  storyScreenshotMetadataList: StoryScreenshotMetadata[];
}
