import pino from "pino";
import fs from "fs-extra";
import { appLogFilepath } from "./Filepath";

if (fs.existsSync(appLogFilepath)) {
  fs.truncateSync(appLogFilepath);
}

export const logger = pino(
  {
    base: undefined,
  },
  pino.transport({
    targets: [
      {
        target: "pino/file",
        options: { destination: appLogFilepath },
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
