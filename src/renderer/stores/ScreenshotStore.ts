import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import { generateTreeFromFlatData } from "../utils/story-tree-utils";
import { ScreenshotState, StoryState } from "../../shared/type";
import {
  getScreenshotPageTreeData,
  type StoryMetadataInExplorer,
} from "../components/screenshot/story-explorer/helper";
import type { SaveScreenshotType } from "../../shared/type";

export type StoryTypeFilter = "all" | "error";

interface SaveInfo {
  type: SaveScreenshotType;
  project: string;
  branch: string;
}

export const useScreenshotStore = defineStore("screenshot", () => {
  const toast = useToast();

  const storybookUrl = ref<string>("");

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
  const processing = computed(() => {
    return (
      state.value !== ScreenshotState.IDLE &&
      state.value !== ScreenshotState.FINISHED &&
      state.value !== ScreenshotState.FAILED
    );
  });

  const _metadata = ref<null | StoryMetadataInExplorer[]>(null);
  // a map of id to index of _metadata for faster search (no need ref as no related to view)
  const _metadataKeyMap = new Map<string, number>();
  const storySearchText = ref<string>("");
  const storyTypeFilterInExplorer = ref<StoryTypeFilter>("all");
  const highlightKey = ref<string | null>(null);
  const expandedKeys = ref(new Set<string>());
  const selectedStoryId = ref<string | null>(null);

  const _filteredMetadata = computed<null | StoryMetadataInExplorer[]>(() => {
    if (_metadata.value === null) return null;
    const arr =
      storyTypeFilterInExplorer.value === "all" ? _metadata.value : _metadata.value.filter(item => item.storyErr);
    return storySearchText.value
      ? arr.filter(item => {
          const lowerCaseSearchText = storySearchText.value.toLowerCase();
          return (
            item.title.toLowerCase().includes(lowerCaseSearchText) ||
            item.name.toLowerCase().includes(lowerCaseSearchText)
          );
        })
      : arr;
  });

  const explorerTreeData = computed(() => {
    return _filteredMetadata.value === null
      ? []
      : getScreenshotPageTreeData(generateTreeFromFlatData(_filteredMetadata.value));
  });

  const expandAll = () => {
    const allKeys = explorerTreeData.value.map(node => getAllNonLeafKeys(node)).flat();
    for (const key of allKeys) {
      expandedKeys.value.add(key);
    }
  };

  const collapseAll = () => {
    expandedKeys.value.clear();
  };

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
    void window.screenshotApi.startScreenshot(storybookUrl.value);
  };

  const displayingImg = ref<{ loading: boolean; isExist: boolean | null; base64: string | null }>({
    loading: false,
    isExist: null,
    base64: null,
  });

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
    _metadataKeyMap.clear();
    storyMetadataList.forEach((item, index) => {
      _metadataKeyMap.set(item.id, index);
    });
    highlightKey.value = null;
    expandedKeys.value.clear();
    selectedStoryId.value = null;
  });

  window.screenshotApi.onUpdateStoryState((storyId, state, browserName, storyErr) => {
    const idx = _metadataKeyMap.get(storyId);
    const story = idx !== undefined ? _metadata.value?.[idx] : null;
    if (story) {
      story.state = state;
      story.browserName = browserName;
      story.storyErr = storyErr;

      if (state === StoryState.CAPTURING) {
        story.startTime = new Date().toISOString();
      } else if (state === StoryState.FINISHED) {
        story.endTime = new Date().toISOString();
      }
    }
  });

  const saveScreenshot = async () => {
    try {
      isSaving.value = true;
      const result = await window.screenshotApi.saveScreenshot(
        saveInfo.value.project,
        saveInfo.value.branch,
        saveInfo.value.type,
      );

      if (result.success) {
        toast.add({ severity: "success", summary: "Success", detail: "Successfully saved the screenshot", life: 5000 });
        savingDialogOpen.value = false;
      } else {
        toast.add({ severity: "error", summary: "Error", detail: "Fail to saved the screenshot", life: 5000 });
        console.log(result.errMsg);
      }
    } finally {
      isSaving.value = false;
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
    explorerTreeData,
    expandedKeys,
    highlightKey,
    storyTypeFilterInExplorer,
    storySearchText,
    displayingImg,
    saveInfo,
    isSaving,
    savingDialogOpen,
    selectedStoryId,
    getDefaultStorybookUrl,
    startScreenshot,
    expandAll,
    collapseAll,
    updateDisplayingImg,
    openInExplorer,
    saveScreenshot,
    openSaveDialog,
  };
});
