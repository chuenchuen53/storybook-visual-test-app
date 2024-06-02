import type { StoryMetadata, StoryMetadataWithRenderStatus } from "../../shared/type";

export interface GetStoriesMetadataResult {
  storyMetadataList: StoryMetadata[];
}

export interface ScreenshotStoriesResult {
  storyScreenshotMetadataList: StoryMetadataWithRenderStatus[];
}
