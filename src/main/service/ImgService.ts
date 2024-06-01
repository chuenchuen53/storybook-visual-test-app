import type { GetImgResponse, SaveScreenshotType } from "../../shared/type";

export interface ImgService {
  getScreenshotImg(id: string): Promise<GetImgResponse>;
  getCompareAddedImg(id: string): Promise<GetImgResponse>;
  getCompareRemovedImg(id: string): Promise<GetImgResponse>;
  getCompareDiffImg(id: string): Promise<GetImgResponse>;
  getSavedRefTestImg(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
    id: string,
  ): Promise<GetImgResponse>;
  getSavedComparisonImg(project: string, setId: string, id: string): Promise<GetImgResponse>;
}
