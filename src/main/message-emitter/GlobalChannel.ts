import { MainWindow } from "../../MainWindow";
import type { GlobalMessage } from "../../shared/type";

export class GlobalChannel {
  public static sendGlobalMessage(type: "success" | "info" | "warn" | "error", message: string, title?: string) {
    const globalMessage: GlobalMessage = { type, title, message };
    MainWindow.send("global:message", globalMessage);
  }
}
