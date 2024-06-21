import type { ImageState } from "../../../composables/useImage";

interface DiffInfo {
  id: string;
  title: string;
  refImg: ImageState;
  testImg: ImageState;
  diffImg: ImageState;
}

interface SimpleImgInfo {
  id: string;
  title: string;
  img: ImageState;
}

export interface ComparisonSummaryImgsProps {
  diff: DiffInfo[];
  added: SimpleImgInfo[];
  removed: SimpleImgInfo[];
}
