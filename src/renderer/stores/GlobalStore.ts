import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import type { AppTheme } from "../../shared/type";

export const useGlobalStore = defineStore("global", () => {
  const _toast = useToast();

  const appTheme = ref<AppTheme>(document.documentElement.classList.contains("dark") ? "dark" : "light");

  const _setTheme = async (theme: AppTheme) => {
    appTheme.value = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    void window.userSettingApi.invoke.setAppTheme(theme);
  };

  const toggleTheme = async () => {
    const nextTheme = appTheme.value === "dark" ? "light" : "dark";
    await _setTheme(nextTheme);
  };

  const getThemeFromSetting = async () => {
    const theme = await window.userSettingApi.invoke.getAppTheme();
    if (theme !== appTheme.value) {
      void _setTheme(theme);
    }
  };

  window.globalApi.listen.onReceiveGlobalMessage(msg => {
    _toast.add({
      severity: msg.type,
      summary: msg.title || msg.type,
      detail: msg.message,
      life: 5000,
    });
  });

  return {
    appTheme,
    getThemeFromSetting,
    toggleTheme,
  };
});
