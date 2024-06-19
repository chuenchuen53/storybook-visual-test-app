import type { ImageState } from "../../../composables/useImage";

interface DiffInfo {
  id: string;
  title: string;
  leftImg: ImageState;
  rightImg: ImageState;
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
