import { defineStore } from "pinia";
import { ref } from "vue";
import type { StoryMetadata } from "../../service/crawler/type";

export const useScreenshotStore = defineStore("counter", () => {
  const storybookUrl = ref<string>("");
  const processing = ref(false);
  const metadata = ref<null | StoryMetadata[]>(null);
  const activeStep = ref(0);

  const getDefaultStorybookUrl = async () => {
    const ip = await window.screenshotApi.getLocalIPAddress();
    if (ip) storybookUrl.value = `http://${ip}:6006`;
  };

  const startScreenshot = async () => {
    console.log("hi");
    processing.value = true;
    window.screenshotApi.startScreenshot(storybookUrl.value);
  };

  return { storybookUrl, processing, activeStep, getDefaultStorybookUrl, startScreenshot };
});
