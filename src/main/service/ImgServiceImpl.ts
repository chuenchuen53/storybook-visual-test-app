import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { LogError } from "../decorator/LogError";
import type { GetImgResponse, SaveScreenshotType } from "../../shared/type";
import type { ImgService } from "./ImgService";

export class ImgServiceImpl implements ImgService {
  private static instance: ImgService = new ImgServiceImpl();

  public static getInstance(): ImgService {
    return ImgServiceImpl.instance;
  }

  private constructor() {}

  @LogError()
  public async getScreenshotImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempScreenshotImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getCompareAddedImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempComparisonAddedImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getCompareRemovedImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempComparisonRemovedImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getCompareDiffImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempComparisonDiffImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getSavedRefTestImg(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    setId: string,
    id: string,
  ): Promise<GetImgResponse> {
    const filepath = FilepathHelper.savedRefTestImgPath(type, project, branch, setId, id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getSavedComparisonImg(project: string, setId: string, id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.savedComparisonImgPath(project, setId, id + ".png");
    return await this.getImg(filepath);
  }

  private async getImg(filepath: string): Promise<GetImgResponse> {
    const isExist = await fs.pathExists(filepath);
    const base64 = isExist ? fs.readFileSync(filepath).toString("base64") : null;
    return { base64, isExist };
  }
}
