import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { ScreenshotState, StoryState } from "../../shared/type";
import { type StoryMetadataInExplorer } from "../components/shared/story-explorer/helper";
import { useStoryExplorer } from "../composables/useStoryExplorer";
import { useImage } from "../composables/useImage";
import type { SaveScreenshotType, StartScreenshotRequest, Viewport } from "../../shared/type";

export interface SaveInfo {
  type: SaveScreenshotType;
  project: string;
  branch: string;
  name: string;
}

export const useScreenshotStore = defineStore("screenshot", () => {
  const _toast = useToast();

  const state = ref<ScreenshotState>(ScreenshotState.IDLE);
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
  const isProcessing = computed<boolean>(() => {
    return (
      state.value !== ScreenshotState.IDLE &&
      state.value !== ScreenshotState.FINISHED &&
      state.value !== ScreenshotState.FAILED
    );
  });

  const storybookUrl = ref<string>("");
  const viewport = ref<Viewport>({ width: 1920, height: 1080 });
  const concurrency = ref(10);

  const getDefaultStorybookUrl = async () => {
    const ip = await window.screenshotApi.invoke.getLocalIPAddress();
    if (ip) storybookUrl.value = `http://${ip}:6006`;
  };

  const startScreenshot = async () => {
    if (isProcessing.value) return;
    state.value = ScreenshotState.CHECKING_SERVICE;
    let req: StartScreenshotRequest = {
      storybookUrl: storybookUrl.value,
      viewport: viewport.value,
      concurrency: concurrency.value,
    };
    // drop reactive to allow object clone
    req = JSON.parse(JSON.stringify(req));
    void window.screenshotApi.send.createNewSet(req);
  };

  const selectedStory = ref<StoryMetadataInExplorer | null>(null);
  const {
    searchText,
    storyTypeFilter,
    highlightKey,
    expandedKeys,
    treeData,
    replaceBackingData,
    getDataById,
    updateItem,
    expandAll,
    collapseAll,
  } = useStoryExplorer<StoryMetadataInExplorer>();

  const { imgState, removeImg, updateImg } = useImage();

  const handleSelectStory = async (id: string) => {
    if (id === selectedStory.value?.id) return;
    const story = getDataById(id);
    if (story) {
      selectedStory.value = story;
      if (story.state !== StoryState.FINISHED) {
        removeImg();
      } else {
        await updateImg(() => window.imgApi.invoke.getTempScreenshotImg(id));
      }
    }
  };

  const isSaving = ref(false);
  const saveDialogOpen = ref(false);
  const saveInfo = ref<SaveInfo>({
    type: "reference",
    project: "my-project",
    branch: "main",
    name: "feature 123",
  });

  const saveScreenshot = async () => {
    try {
      isSaving.value = true;
      const result = await window.screenshotApi.invoke.save({
        type: saveInfo.value.type,
        project: saveInfo.value.project,
        branch: saveInfo.value.branch,
        name: saveInfo.value.name,
      });

      if (result.success) {
        _toast.add({
          severity: "success",
          summary: "Success",
          detail: "Successfully saved the screenshot",
          life: 5000,
        });
        saveDialogOpen.value = false;
      } else {
        _toast.add({
          severity: "error",
          summary: "Error",
          detail: "Fail to saved the screenshot",
          life: 5000,
        });
        console.log(result.errMsg);
      }
    } finally {
      isSaving.value = false;
    }
  };

  const openInExplorer = () => {
    window.screenshotApi.send.openInExplorer();
  };

  window.screenshotApi.listen.onUpdateStatus(status => {
    state.value = status;
  });

  window.screenshotApi.listen.onNewMetadata(storyMetadataList => {
    replaceBackingData(
      storyMetadataList.map(x => ({
        id: x.id,
        title: x.title,
        name: x.name,
        tags: x.tags,
        state: StoryState.WAITING,
        browserName: null,
        startTime: null,
        endTime: null,
        storyErr: null,
      })),
    );
    selectedStory.value = null;
    removeImg();
  });

  window.screenshotApi.listen.onUpdateStoryState(async ({ storyId, state, browserName, storyErr }) => {
    const story = getDataById(storyId);
    if (story) {
      if (state === StoryState.CAPTURING) {
        updateItem(storyId, {
          state,
          browserName,
          storyErr,
          startTime: new Date().toISOString(),
        });
      } else if (state === StoryState.FINISHED) {
        updateItem(storyId, {
          state,
          browserName,
          storyErr,
          endTime: new Date().toISOString(),
        });
        if (storyId === selectedStory.value?.id) {
          await updateImg(() => window.imgApi.invoke.getTempScreenshotImg(storyId));
        }
      }
    }
  });

  return {
    state,
    storybookUrl,
    viewport,
    concurrency,
    isProcessing,
    activeStep,
    treeData,
    expandedKeys,
    highlightKey,
    storyTypeFilter,
    searchText,
    imgState,
    saveInfo,
    isSaving,
    saveDialogOpen,
    selectedStory,
    handleSelectStory,
    getDefaultStorybookUrl,
    startScreenshot,
    expandAll,
    collapseAll,
    openInExplorer,
    saveScreenshot,
  };
});
