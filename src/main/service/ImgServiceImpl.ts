import path from "path";
import fs from "fs-extra";
import {
  comparisonAddedDir,
  comparisonDiffDir,
  comparisonRemovedDir,
  savedReferenceDir,
  savedTestDir,
  screenshotDir,
} from "../Filepath";
import type { GetImgResponse, SaveScreenshotType } from "../../shared/type";
import type { ImgService } from "./ImgService";

export class ImgServiceImpl implements ImgService {
  private static instance: ImgService = new ImgServiceImpl();

  public static getInstance(): ImgService {
    return ImgServiceImpl.instance;
  }

  private constructor() {}

  public async getScreenshotImg(id: string): Promise<GetImgResponse> {
    const filepath = path.join(screenshotDir, id + ".png");
    return await this.getImg(filepath);
  }

  public async getCompareAddedImg(id: string): Promise<GetImgResponse> {
    const filepath = path.join(comparisonAddedDir, id + ".png");
    return await this.getImg(filepath);
  }

  public async getCompareRemovedImg(id: string): Promise<GetImgResponse> {
    const filepath = path.join(comparisonRemovedDir, id + ".png");
    return await this.getImg(filepath);
  }

  public async getCompareDiffImg(id: string): Promise<GetImgResponse> {
    const filepath = path.join(comparisonDiffDir, id + ".png");
    return await this.getImg(filepath);
  }

  public async getSavedImg(
    type: SaveScreenshotType,
    project: string,
    branch: string,
    uuid: string,
    id: string,
  ): Promise<GetImgResponse> {
    const typeDir = type === "reference" ? savedReferenceDir : savedTestDir;
    const filepath = path.join(typeDir, project, branch, uuid, id + ".png");
    return await this.getImg(filepath);
  }

  private async getImg(filepath: string): Promise<GetImgResponse> {
    const isExist = await fs.pathExists(filepath);
    const base64 = isExist ? fs.readFileSync(filepath).toString("base64") : null;
    return { base64, isExist };
  }
}
