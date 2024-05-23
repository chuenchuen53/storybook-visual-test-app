import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { ScreenshotState, StoryState } from "../../shared/type";

import type { StoryMetadataInExplorer } from "../components/screenshot/story-explorer/helper";

export type StoryTypeFilter = "all" | "error";

interface SaveInfo {
  type: string;
  project: string;
  branch: string;
}

export const useScreenshotStore = defineStore("screenshot", () => {
  const toast = useToast();

  const storybookUrl = ref<string>("");
  const state = ref<ScreenshotState>(ScreenshotState.IDLE);
  // const _metadata = ref<null | StoryMetadataInExplorer[]>(mockData);
  const _metadata = ref<null | StoryMetadataInExplorer[]>(null);
  // const activeStep = ref(1);
  const activeStep = computed<number>(() => {
    switch (state.value) {
      case ScreenshotState.IDLE:
        return 0;
      case ScreenshotState.CHECKING_SERVICE:
        return 1;
      case ScreenshotState.PREPARING_METADATA_BROWSER:
        return 2;
      case ScreenshotState.COMPUTING_METADATA:
        return 3;
      case ScreenshotState.PREPARING_SCREENSHOT_BROWSER:
        return 4;
      case ScreenshotState.CAPTURING_SCREENSHOT:
        return 5;
      case ScreenshotState.FINISHED:
        return 6;
      case ScreenshotState.FAILED:
        return 0;
      default:
        return 0;
    }
  });
  const apiLogs = ref<string[]>([]);
  const storyTypeFilter = ref<StoryTypeFilter>("all");
  const displayingImg = ref<{ loading: boolean; isExist: boolean | null; base64: string | null }>({
    loading: false,
    isExist: null,
    base64: null,
  });

  const processing = computed(() => {
    return (
      state.value !== ScreenshotState.IDLE &&
      state.value !== ScreenshotState.FINISHED &&
      state.value !== ScreenshotState.FAILED
    );
  });

  const metadata = computed(() => {
    if (_metadata.value === null) return null;
    if (storyTypeFilter.value === "all") return _metadata.value;
    console.log(_metadata.value);
    return _metadata.value.filter(item => item.storyErr);
  });

  const isSaving = ref(false);
  const savingDialogOpen = ref(false);
  const saveInfo = ref<SaveInfo>({
    type: "reference",
    project: "my-project",
    branch: "main",
  });

  const getDefaultStorybookUrl = async () => {
    const ip = await window.screenshotApi.getLocalIPAddress();
    if (ip) storybookUrl.value = `http://${ip}:6006`;
  };

  const startScreenshot = async () => {
    state.value = ScreenshotState.CHECKING_SERVICE;
    window.screenshotApi.startScreenshot(storybookUrl.value);
  };

  const setStoryTypeFilter = (filter: StoryTypeFilter) => {
    console.log(filter);
    storyTypeFilter.value = filter;
  };

  const updateDisplayingImg = async (id: string) => {
    displayingImg.value = { loading: true, isExist: null, base64: null };
    const result = await window.imgApi.getScreenshotImg(id);
    displayingImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  window.screenshotApi.onUpdateStatus(status => {
    state.value = status;
  });

  window.screenshotApi.onNewMetadata(storyMetadataList => {
    _metadata.value = storyMetadataList.map(x => ({
      id: x.id,
      title: x.title,
      name: x.name,
      tags: x.tags,
      state: StoryState.WAITING,
      browserName: null,
      startTime: null,
      endTime: null,
      storyErr: null,
    }));
  });

  window.screenshotApi.onUpdateStoryState((storyId, state, browserName, storyErr) => {
    const story = _metadata.value?.find(item => item.id === storyId);
    if (story) {
      story.state = state;
      story.browserName = browserName;
      if (storyErr !== null) {
        story.storyErr = storyErr;
      }
      if (state === StoryState.CAPTURING) {
        story.startTime = new Date().toISOString();
      } else if (state === StoryState.FINISHED) {
        story.endTime = new Date().toISOString();
      }
    }
  });

  const saveScreenshot = async () => {
    isSaving.value = true;
    const result = await window.screenshotApi.saveScreenshot(
      saveInfo.value.project,
      saveInfo.value.branch,
      saveInfo.value.type,
    );

    isSaving.value = false;
    if (result.success) {
      toast.add({ severity: "success", summary: "Success", detail: "Successfully saved the screenshot", life: 5000 });
      savingDialogOpen.value = false;
    } else {
      toast.add({ severity: "error", summary: "Error", detail: "Fail to saved the screenshot", life: 5000 });
      console.log(result.errMsg);
    }
  };

  const openInExplorer = () => {
    window.screenshotApi.openInExplorer();
  };

  const openSaveDialog = () => {
    savingDialogOpen.value = true;
  };

  return {
    state,
    storybookUrl,
    processing,
    activeStep,
    metadata,
    apiLogs,
    storyTypeFilter,
    displayingImg,
    saveInfo,
    isSaving,
    savingDialogOpen,
    setStoryTypeFilter,
    getDefaultStorybookUrl,
    startScreenshot,
    updateDisplayingImg,
    openInExplorer,
    saveScreenshot,
    openSaveDialog,
  };
});
