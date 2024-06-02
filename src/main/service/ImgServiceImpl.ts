import fs from "fs-extra";
import { FilepathHelper } from "../Filepath";
import { LogError } from "../decorator/LogError";
import type { GetImgResponse } from "../../shared/type";
import type { ImgService } from "./ImgService";

export class ImgServiceImpl implements ImgService {
  private static instance: ImgService = new ImgServiceImpl();

  public static getInstance(): ImgService {
    return ImgServiceImpl.instance;
  }

  private constructor() {}

  @LogError()
  public async getTempScreenshotImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempScreenshotImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getTempComparisonDiffImg(id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.tempComparisonDiffImgPath(id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getSavedScreenshotImg(
    project: string,
    branch: string,
    setId: string,
    id: string,
  ): Promise<GetImgResponse> {
    const filepath = FilepathHelper.savedScreenshotImgPath(project, branch, setId, id + ".png");
    return await this.getImg(filepath);
  }

  @LogError()
  public async getSavedComparisonDiffImg(project: string, setId: string, id: string): Promise<GetImgResponse> {
    const filepath = FilepathHelper.savedComparisonDiffImgPath(project, setId, id + ".png");
    return await this.getImg(filepath);
  }

  private async getImg(filepath: string): Promise<GetImgResponse> {
    const isExist = await fs.pathExists(filepath);
    const base64 = isExist ? (await fs.readFile(filepath)).toString("base64") : null;
    return { base64, isExist };
  }
}
