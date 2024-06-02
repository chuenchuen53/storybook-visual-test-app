import type { GetImgResponse, SaveScreenshotType } from "../../shared/type";

export interface ImgService {
  getTempScreenshotImg(id: string): Promise<GetImgResponse>;
  getTempComparisonDiffImg(id: string): Promise<GetImgResponse>;
  getSavedRefTestImg(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
    id: string,
  ): Promise<GetImgResponse>;
  getSavedComparisonDiffImg(project: string, setId: string, id: string): Promise<GetImgResponse>;
}
