import type { UserSettingApi } from "./shared/UserSettingApi";
import type { SavedSetApi } from "./shared/SavedSetApi";
import type { ImgApi } from "./shared/ImgApi";
import type { ComparisonApi } from "./shared/ComparisonApi";
import type { ScreenshotApi } from "./shared/ScreenshotApi";
import type { GlobalApi } from "./shared/GlobalApi";

declare global {
  interface Window {
    globalApi: GlobalApi;
    userSettingApi: UserSettingApi;
    imgApi: ImgApi;
    screenshotApi: ScreenshotApi;
    comparisonApi: ComparisonApi;
    savedSetApi: SavedSetApi;
  }
}
