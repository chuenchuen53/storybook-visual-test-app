import type { IpcMainInvokeEvent } from "electron";

export interface IpcApi {
  listen: Record<string, (cb: (...args: any[]) => void) => void>;
  send: Record<string, (...args: any[]) => void>;
  invoke: Record<string, (...args: any[]) => Promise<unknown>>;
}

export interface IpcChannel<T extends IpcApi> {
  listen: Record<keyof T["listen"], string>;
  send: Record<keyof T["send"], string>;
  invoke: Record<keyof T["invoke"], string>;
}

export type IpcMainHandlerType<T extends (...args: unknown[]) => unknown | Promise<unknown>> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => ReturnType<T>;

export type IpcMainHandler<T extends IpcApi> = {
  send: { [K in keyof T["send"]]: IpcMainHandlerType<T["send"][K]> };
  invoke: { [K in keyof T["invoke"]]: IpcMainHandlerType<T["invoke"][K]> };
};

export type IpcRendererHandlerType<T extends (...args: unknown[]) => unknown | Promise<unknown>> = (
  ...args: Parameters<T>
) => any;

export type IpcRendererHandler<T extends IpcApi> = {
  listen: { [K in keyof T["listen"]]: T["listen"][K] };
  send: { [K in keyof T["send"]]: IpcRendererHandlerType<T["send"][K]> };
  invoke: { [K in keyof T["invoke"]]: IpcRendererHandlerType<T["invoke"][K]> };
};

export type FirstParamTypeForListener<T extends IpcApi, K extends keyof T["listen"]> = Parameters<
  Parameters<T["listen"][K]>[0]
>[0];
