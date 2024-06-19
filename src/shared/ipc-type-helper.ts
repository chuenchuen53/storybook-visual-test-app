import type { IpcMainInvokeEvent } from "electron";

/* eslint-disable @typescript-eslint/no-explicit-any */

type MapIfNotEmpty<T, ValueType> = T extends Record<string, never> ? Record<string, never> : Record<keyof T, ValueType>;

export interface IpcApi {
  listen: Record<string, (cb: (...args: any[]) => void) => void>;
  send: Record<string, (...args: any[]) => void>;
  invoke: Record<string, (...args: any[]) => Promise<unknown>>;
}

export interface IpcChannel<T extends IpcApi> {
  listen: MapIfNotEmpty<T["listen"], string>;
  send: MapIfNotEmpty<T["send"], string>;
  invoke: MapIfNotEmpty<T["invoke"], string>;
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

export type FirstParamType<T extends (args: any) => void> = Parameters<T>[0];

export type FirstParamTypeForListener<T extends IpcApi, K extends keyof T["listen"]> = Parameters<
  Parameters<T["listen"][K]>[0]
>[0];
