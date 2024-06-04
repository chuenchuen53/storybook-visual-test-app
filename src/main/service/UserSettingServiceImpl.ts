import { UserSettingHelper } from "../persistence/UserSettingHelper";
import { CatchError } from "../decorator/CatchError";
import { LogError } from "../decorator/LogError";
import type { UserSettingService } from "./UserSettingService";
import type { AppTheme, UserSetting } from "../../shared/type";

export class UserSettingServiceImpl implements UserSettingService {
  private static readonly instance: UserSettingService = new UserSettingServiceImpl();

  public static getInstance(): UserSettingService {
    return UserSettingServiceImpl.instance;
  }

  private constructor() {}

  @CatchError<AppTheme>("light")
  @LogError()
  public async getAppTheme(): Promise<AppTheme> {
    const setting = await UserSettingHelper.read();
    return setting?.appTheme ?? "light";
  }

  @CatchError<boolean>(false)
  @LogError()
  public async setAppTheme(theme: AppTheme): Promise<boolean> {
    const setting: UserSetting = (await UserSettingHelper.read()) ?? {};
    setting.appTheme = theme;
    return await UserSettingHelper.save(setting);
  }

  @CatchError<string[]>([])
  @LogError()
  public async getProjectsInTab(): Promise<string[]> {
    const setting = await UserSettingHelper.read();
    return setting?.projectsInTab ?? [];
  }

  @CatchError<boolean>(false)
  @LogError()
  public async setProjectsInTab(projects: string[]): Promise<boolean> {
    const setting: UserSetting = (await UserSettingHelper.read()) ?? {};
    setting.projectsInTab = projects;
    return await UserSettingHelper.save(setting);
  }
}
