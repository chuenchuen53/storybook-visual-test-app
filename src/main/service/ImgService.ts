import type { GetImgResponse } from "../../shared/type";

export interface ImgService {
  getTempScreenshotImg(id: string): Promise<GetImgResponse>;
  getTempComparisonDiffImg(id: string): Promise<GetImgResponse>;
  getSavedScreenshotImg(project: string, branch: string, setId: string, id: string): Promise<GetImgResponse>;
  getSavedComparisonDiffImg(project: string, setId: string, id: string): Promise<GetImgResponse>;
}
