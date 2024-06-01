import { UserSettingHelper } from "../data-files/UserSettingHelper";
import { CatchError } from "../decorator/CatchError";
import { LogError } from "../decorator/LogError";
import type { UserSettingService } from "./UserSettingService";
import type { UserSetting } from "../../shared/type";

export class UserSettingServiceImpl implements UserSettingService {
  private static readonly instance: UserSettingService = new UserSettingServiceImpl();

  public static getInstance(): UserSettingService {
    return UserSettingServiceImpl.instance;
  }

  private constructor() {}

  @CatchError<string[]>([])
  @LogError()
  public async getProjectsInTab(): Promise<string[]> {
    const setting = await UserSettingHelper.read();
    return setting?.projectsInTab ?? [];
  }

  @CatchError<boolean>(false)
  @LogError()
  public async updateProjectsInTab(projects: string[]): Promise<boolean> {
    const setting: UserSetting = (await UserSettingHelper.read()) ?? {};
    setting.projectsInTab = projects;
    return await UserSettingHelper.save(setting);
  }
}
