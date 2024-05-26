export interface UserSettingService {
  getProjectsInTab: () => Promise<string[]>;
  updateProjectsInTab: (projects: string[]) => Promise<boolean>;
}
