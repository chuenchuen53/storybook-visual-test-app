import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { StoryMetadata } from "../../service/crawler/type";

export enum ScreenshotState {
  IDLE = "IDLE",
  CHECKING_SERVICE = "CHECKING_SERVICE",
  PREPARING_METADATA_BROWSER = "PREPARING_METADATA_BROWSER",
  COMPUTING_METADATA = "COMPUTING_METADATA",
  PREPARING_SCREENSHOT_BROWSER = "PREPARING_SCREENSHOT_BROWSER",
  CAPTURING_SCREENSHOT = "CAPTURING_SCREENSHOT",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export const useScreenshotStore = defineStore("counter", () => {
  const storybookUrl = ref<string>("");
  const state = ref<ScreenshotState>(ScreenshotState.IDLE);
  const metadata = ref<null | StoryMetadata[]>(null);
  const activeStep = ref(0);
  const apiLogs = ref<string[]>([]);

  const processing = computed(() => {
    return (
      state.value !== ScreenshotState.IDLE &&
      state.value !== ScreenshotState.FINISHED &&
      state.value !== ScreenshotState.FAILED
    );
  });

  const getDefaultStorybookUrl = async () => {
    const ip = await window.screenshotApi.getLocalIPAddress();
    if (ip) storybookUrl.value = `http://${ip}:6006`;
  };

  const startScreenshot = async () => {
    state.value = ScreenshotState.CHECKING_SERVICE;
    window.screenshotApi.startScreenshot(storybookUrl.value);
  };

  window.screenshotApi.onReceiveScreenshotInfo(params => {
    switch (params.type) {
      case "status":
      case "error":
      case "new-metadata":
      case "update-story-state":
        console.log(params);
    }
  });

  return { storybookUrl, processing, activeStep, metadata, apiLogs, getDefaultStorybookUrl, startScreenshot };
});
