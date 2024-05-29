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
import type { Viewport, SaveScreenshotType } from "../../shared/type";

export type StoryTypeFilter = "all" | "error";

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

  const getDefaultStorybookUrl = async () => {
    const ip = await window.screenshotApi.invoke.getLocalIPAddress();
    if (ip) storybookUrl.value = `http://${ip}:6006`;
  };

  const startScreenshot = async () => {
    if (isProcessing.value) return;
    state.value = ScreenshotState.CHECKING_SERVICE;
    void window.screenshotApi.send.startScreenshot(storybookUrl.value);
  };

  const _metadata = ref<null | StoryMetadataInExplorer[]>(null);
  // a map of id to index of _metadata for faster search (no need ref as no related to view)
  const _metadataKeyMap = new Map<string, number>();
  const storySearchText = ref<string>("");
  const storyTypeFilter = ref<StoryTypeFilter>("all");
  const highlightKey = ref<string | null>(null);
  const expandedKeys = ref(new Set<string>());
  const selectedStory = ref<StoryMetadataInExplorer | null>(null);
  const displayingImg = ref<{ loading: boolean; isExist: boolean | null; base64: string | null }>({
    loading: false,
    isExist: null,
    base64: null,
  });
  const _filteredMetadata = computed<null | StoryMetadataInExplorer[]>(() => {
    if (_metadata.value === null) return null;
    const lowerCaseSearchText = storySearchText.value.toLowerCase();
    return _metadata.value.filter(
      item =>
        (storyTypeFilter.value === "all" || item.storyErr) &&
        (item.title.toLowerCase().includes(lowerCaseSearchText) ||
          item.name.toLowerCase().includes(lowerCaseSearchText)),
    );
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

  const _getImg = async (id: string) => {
    displayingImg.value = { loading: true, isExist: null, base64: null };
    const { isExist, base64 } = await window.imgApi.invoke.getScreenshotImg(id);
    displayingImg.value = { loading: false, isExist, base64 };
  };

  const handleSelectStory = async (id: string) => {
    if (id === selectedStory.value?.id) return;
    const index = _metadataKeyMap.get(id);
    const story = index !== undefined ? _metadata.value?.[index] ?? null : null;
    selectedStory.value = story;
    if (story) {
      if (story.state !== StoryState.FINISHED) {
        displayingImg.value = { loading: false, isExist: null, base64: null };
      } else {
        await _getImg(id);
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

  window.screenshotApi.listen.onUpdateStatus(status => {
    state.value = status;
  });

  window.screenshotApi.listen.onNewMetadata(storyMetadataList => {
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
    selectedStory.value = null;
    displayingImg.value = { loading: false, isExist: null, base64: null };
  });

  window.screenshotApi.listen.onUpdateStoryState(async ({ storyId, state, browserName, storyErr }) => {
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
        if (storyId === selectedStory.value?.id) {
          await _getImg(storyId);
        }
      }
    }
  });

  const saveScreenshot = async () => {
    try {
      isSaving.value = true;
      const result = await window.screenshotApi.invoke.saveScreenshot({
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

  return {
    state,
    storybookUrl,
    viewport,
    isProcessing,
    activeStep,
    explorerTreeData,
    expandedKeys,
    highlightKey,
    storyTypeFilter,
    storySearchText,
    displayingImg,
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
