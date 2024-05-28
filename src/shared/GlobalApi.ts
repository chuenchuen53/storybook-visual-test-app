import type { IpcApi } from "./ipc-type-helper";
import type { GlobalMessage } from "./type";

export interface GlobalApi extends IpcApi {
  listen: {
    onReceiveGlobalMessage: (cb: (msg: GlobalMessage) => void) => void;
  };
}
