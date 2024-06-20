import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { ScreenshotState, StoryState } from "../../shared/type";
import { type StoryMetadataInScreenshotPageExplorer } from "../components/shared/story-explorer/helper";
import { useStoryExplorer } from "../composables/useStoryExplorer";
import { useImage } from "../composables/useImage";
import type { CreateNewScreenshotSetRequest, Viewport } from "../../shared/type";

export interface SaveInfo {
  project: string;
  branch: string;
  name: string;
}

export const useScreenshotStore = defineStore("screenshot", () => {
  const _toast = useToast();

  const state = ref<ScreenshotState>(ScreenshotState.IDLE);
  const stateTimeStamp = ref(new Map<ScreenshotState, Date>());
  const finishedStoriesCount = ref(0);
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
    stateTimeStamp.value.clear();
    state.value = ScreenshotState.CHECKING_SERVICE;
    stateTimeStamp.value.set(ScreenshotState.CHECKING_SERVICE, new Date());
    finishedStoriesCount.value = 0;
    const req: CreateNewScreenshotSetRequest = {
      storybookUrl: storybookUrl.value,
      // do not assign viewport.value directly, as it need to drop reactive to allow object clone
      viewport: {
        width: viewport.value.width,
        height: viewport.value.height,
      },
      concurrency: concurrency.value,
    };
    void window.screenshotApi.send.createNewSet(req);
  };

  const {
    searchText,
    storyTypeFilter,
    highlightKey,
    expandedKeys,
    treeData,
    totalStoriesCount,
    selectedStory,
    replaceBackingData,
    getDataById,
    updateItem,
    expandAll,
    collapseAll,
    selectPrevStory: _selectPrevStory,
    selectNextStory: _selectNextStory,
  } = useStoryExplorer<StoryMetadataInScreenshotPageExplorer>();

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

  const selectPrevStory = async () => {
    await _selectPrevStory(handleSelectStory);
  };

  const selectNextStory = async () => {
    await _selectNextStory(handleSelectStory);
  };

  const isSaving = ref(false);
  const saveDialogOpen = ref(false);
  const saveInfo = ref<SaveInfo>({
    project: "",
    branch: "",
    name: "",
  });
  const allProjects = ref<string[]>([]);
  const allBranches = ref<string[]>([]);

  const saveScreenshot = async () => {
    try {
      isSaving.value = true;
      const result = await window.screenshotApi.invoke.save({
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
        console.error(result.errMsg);
      }
    } finally {
      isSaving.value = false;
    }
  };

  const getAllSavedProjects = async () => {
    allProjects.value = await window.savedSetApi.invoke.getAllSavedProjects();
  };

  const getAllBranches = async (project: string) => {
    allBranches.value = await window.savedSetApi.invoke.getAllSavedBranches(project);
  };

  const openInExplorer = () => {
    window.screenshotApi.send.openInExplorer();
  };

  window.screenshotApi.listen.onUpdateStatus(status => {
    state.value = status;
    stateTimeStamp.value.set(status, new Date());
  });

  window.screenshotApi.listen.onNewMetadata(storyMetadataList => {
    replaceBackingData(
      storyMetadataList.map(x => ({
        id: x.id,
        title: x.title,
        name: x.name,
        tags: x.tags,
        state: StoryState.WAITING,
        workerName: null,
        startTime: null,
        endTime: null,
        storyErr: null,
      })),
    );
    selectedStory.value = null;
    removeImg();
  });

  window.screenshotApi.listen.onUpdateStoryState(async ({ storyId, state, workerName, storyErr }) => {
    const story = getDataById(storyId);
    if (story) {
      if (state === StoryState.CAPTURING) {
        updateItem(storyId, {
          state,
          workerName,
          storyErr,
          startTime: new Date().toISOString(),
        });
      } else if (state === StoryState.FINISHED) {
        updateItem(storyId, {
          state,
          workerName,
          storyErr,
          endTime: new Date().toISOString(),
        });
        finishedStoriesCount.value += 1;
        if (storyId === selectedStory.value?.id) {
          await updateImg(() => window.imgApi.invoke.getTempScreenshotImg(storyId));
        }
      }
    }
  });

  return {
    state,
    stateTimeStamp,
    storybookUrl,
    viewport,
    concurrency,
    isProcessing,
    treeData,
    expandedKeys,
    highlightKey,
    storyTypeFilter,
    searchText,
    imgState,
    saveInfo,
    isSaving,
    saveDialogOpen,
    allProjects,
    allBranches,
    selectedStory,
    totalStoriesCount,
    finishedStoriesCount,
    getAllBranches,
    getAllSavedProjects,
    handleSelectStory,
    getDefaultStorybookUrl,
    startScreenshot,
    selectPrevStory,
    selectNextStory,
    expandAll,
    collapseAll,
    openInExplorer,
    saveScreenshot,
  };
});
