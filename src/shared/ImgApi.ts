import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { GetImgResponse, GetSavedComparisonImgRequest, GetSavedRefTestImgRequest } from "./type";

export interface ImgApi extends IpcApi {
  listen: Record<string, never>;
  send: Record<string, never>;
  invoke: {
    getScreenshotImg: (id: string) => Promise<GetImgResponse>;
    getCompareAddedImg: (id: string) => Promise<GetImgResponse>;
    getCompareRemovedImg: (id: string) => Promise<GetImgResponse>;
    getCompareDiffImg: (id: string) => Promise<GetImgResponse>;
    getSavedRefTestImg: (req: GetSavedRefTestImgRequest) => Promise<GetImgResponse>;
    getSavedComparisonDiffImg: (req: GetSavedComparisonImgRequest) => Promise<GetImgResponse>;
  };
}

export const ImgChannelKey: IpcChannel<ImgApi> = {
  listen: {},
  send: {},
  invoke: {
    getScreenshotImg: "img:getScreenshotImg",
    getCompareAddedImg: "img:getCompareAddImg",
    getCompareRemovedImg: "img:getCompareRemovedImg",
    getCompareDiffImg: "img:getCompareDiffImg",
    getSavedRefTestImg: "img:getSavedRefTestImg",
    getSavedComparisonDiffImg: "img:getSavedComparisonDiffImg",
  },
};
