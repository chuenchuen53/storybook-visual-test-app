import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { GetImgResponse, GetSavedComparisonImgRequest, GetSavedRefTestImgRequest } from "./type";

export interface ImgApi extends IpcApi {
  listen: Record<string, never>;
  send: Record<string, never>;
  invoke: {
    getTempScreenshotImg: (id: string) => Promise<GetImgResponse>;
    getTempComparisonDiffImg: (id: string) => Promise<GetImgResponse>;
    getSavedRefTestImg: (req: GetSavedRefTestImgRequest) => Promise<GetImgResponse>;
    getSavedComparisonDiffImg: (req: GetSavedComparisonImgRequest) => Promise<GetImgResponse>;
  };
}

export const ImgChannelKey: IpcChannel<ImgApi> = {
  listen: {},
  send: {},
  invoke: {
    getTempScreenshotImg: "img:getTempScreenshotImg",
    getTempComparisonDiffImg: "img:getTempComparisonDiffImg",
    getSavedRefTestImg: "img:getSavedRefTestImg",
    getSavedComparisonDiffImg: "img:getSavedComparisonDiffImg",
  },
};
