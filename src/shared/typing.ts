export interface Viewport {
  width: number;
  height: number;
}

export enum StoryState {
  WAITING = "WAITING",
  CAPTURING = "CAPTURING",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
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
