import type { GetImgResponse, SaveScreenshotType } from "../../interface";

export interface ImgService {
  getScreenshotImg(id: string): Promise<GetImgResponse>;
  getCompareAddedImg(id: string): Promise<GetImgResponse>;
  getCompareRemovedImg(id: string): Promise<GetImgResponse>;
  getCompareDiffImg(id: string): Promise<GetImgResponse>;
  getSavedImg(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    uuid: string,
    id: string,
  ): Promise<GetImgResponse>;
}
