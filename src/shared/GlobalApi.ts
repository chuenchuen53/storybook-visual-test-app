import type { IpcApi, IpcChannel } from "./ipc-type-helper";
import type { GlobalMessage } from "./type";

export interface GlobalApi extends IpcApi {
  listen: {
    onReceiveGlobalMessage: (cb: (msg: GlobalMessage) => void) => void;
  };
  send: {};
  invoke: {};
}

export const GlobalChannelKey: IpcChannel<GlobalApi> = {
  listen: {
    onReceiveGlobalMessage: "global:onReceiveGlobalMessage",
  },
  send: {},
  invoke: {},
};
