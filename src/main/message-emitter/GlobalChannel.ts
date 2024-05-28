import { MainWindow } from "../../MainWindow";
import type { GlobalApi } from "../../shared/GlobalApi";
import type { FirstParamTypeForListener } from "../../shared/ipc-type-helper";

export class GlobalChannel {
  public static sendGlobalMessage(message: FirstParamTypeForListener<GlobalApi, "onReceiveGlobalMessage">) {
    MainWindow.send("global:message", message);
  }
}
