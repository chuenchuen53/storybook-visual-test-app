import type { IpcApi } from "./ipc-type-helper";
import type { GetImgResponse, GetSavedImgRequest } from "./type";

export interface ImgApi extends IpcApi {
  listen: Record<string, never>;
  send: Record<string, never>;
  invoke: {
    getScreenshotImg: (id: string) => Promise<GetImgResponse>;
    getCompareAddedImg: (id: string) => Promise<GetImgResponse>;
    getCompareRemovedImg: (id: string) => Promise<GetImgResponse>;
    getCompareDiffImg: (id: string) => Promise<GetImgResponse>;
    getSavedImg: (req: GetSavedImgRequest) => Promise<GetImgResponse>;
  };
}

export const ImgChannelKey = {
  listen: {},
  send: {},
  invoke: {
    getScreenshotImg: "img:getScreenshotImg",
    getCompareAddedImg: "img:getCompareAddImg",
    getCompareRemovedImg: "img:getCompareRemovedImg",
    getCompareDiffImg: "img:getCompareDiffImg",
    getSavedImg: "img:getSavedImg",
  },
};
