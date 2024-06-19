import { ipcMain } from "electron";
import type { IpcApi, IpcChannel, IpcMainHandler } from "../../shared/ipc-type-helper";

export function registerHandlers<T extends IpcApi>(channelKey: IpcChannel<T>, handler: IpcMainHandler<T>) {
  for (const key in channelKey.send) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcMain.on(channelKey.send[key], handler.send[key] as any);
  }

  for (const key in channelKey.invoke) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcMain.handle(channelKey.invoke[key], handler.invoke[key] as any);
  }
}
