import type { AppTheme } from "../../shared/type";

export interface UserSettingService {
  getAppTheme: () => Promise<AppTheme>;
  setAppTheme: (theme: AppTheme) => Promise<boolean>;
  getProjectsInTab: () => Promise<string[]>;
  setProjectsInTab: (projects: string[]) => Promise<boolean>;
}
