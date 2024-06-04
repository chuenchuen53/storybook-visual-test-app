import pino from "pino";
import fs from "fs-extra";
import { app } from "electron";
import { FilepathHelper } from "./Filepath";

const logPath = FilepathHelper.appLogPath();
if (fs.existsSync(logPath)) {
  fs.truncateSync(logPath);
}

export const logger = app.isPackaged
  ? pino(
      { base: undefined },
      pino.transport({
        targets: [
          {
            target: "pino/file",
            options: { destination: logPath },
          },
        ],
      }),
    )
  : pino(
      { base: undefined },
      pino.transport({
        targets: [
          {
            target: "pino/file",
            options: { destination: logPath },
          },
          {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          },
        ],
      }),
    );
