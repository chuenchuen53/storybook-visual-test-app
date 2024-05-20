import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useToast } from "primevue/usetoast";
import { ScreenshotState } from "../../typing";
import { StoryState } from "../../service/crawler/type";
import type { StoryMetadataInExplorer } from "../utils";

export type StoryTypeFilter = "all" | "error";

// export enum ScreenshotState {
//   IDLE = "IDLE",
//   CHECKING_SERVICE = "CHECKING_SERVICE",
//   PREPARING_METADATA_BROWSER = "PREPARING_METADATA_BROWSER",
//   COMPUTING_METADATA = "COMPUTING_METADATA",
//   PREPARING_SCREENSHOT_BROWSER = "PREPARING_SCREENSHOT_BROWSER",
//   CAPTURING_SCREENSHOT = "CAPTURING_SCREENSHOT",
//   FINISHED = "FINISHED",
//   FAILED = "FAILED",
// }
//
// const mockData: StoryMetadataInExplorer[] = [
//   {
//     id: "general-button--main",
//     componentId: "general-button",
//     title: "general/Button",
//     kind: "general/Button",
//     tags: ["dev", "test"],
//     name: "Main",
//     story: "Main",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-button--disabled",
//     componentId: "general-button",
//     title: "general/Button",
//     kind: "general/Button",
//     tags: ["dev", "test"],
//     name: "Disabled",
//     story: "Disabled",
//     state: StoryState.CAPTURING,
//     browserName: null,
//     startTime: "2024-05-18T20:05:47.756Z",
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-button--loading",
//     componentId: "general-button",
//     title: "general/Button",
//     kind: "general/Button",
//     tags: ["dev", "test"],
//     name: "Loading",
//     story: "Loading",
//     state: StoryState.FINISHED,
//     browserName: null,
//     startTime: "2024-05-18T20:05:47.756Z",
//     endTime: "2024-05-18T20:05:57.756Z",
//     storyErr: null,
//   },
//   {
//     id: "general-iconbutton--icon-button",
//     componentId: "general-iconbutton",
//     title: "general/IconButton",
//     kind: "general/IconButton",
//     tags: ["dev", "test"],
//     name: "Icon Button",
//     story: "Icon Button",
//     state: StoryState.FAILED,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-linkbutton--link-button",
//     componentId: "general-linkbutton",
//     title: "general/LinkButton",
//     kind: "general/LinkButton",
//     tags: ["dev", "test"],
//     name: "Link Button",
//     story: "Link Button",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: true,
//   },
//   {
//     id: "general-datepicker--date-picker",
//     componentId: "general-datepicker",
//     title: "general/DatePicker",
//     kind: "general/DatePicker",
//     tags: ["dev", "test"],
//     name: "Date Picker",
//     story: "Date Picker",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-dropdown--dropdown",
//     componentId: "general-dropdown",
//     title: "general/Dropdown",
//     kind: "general/Dropdown",
//     tags: ["dev", "test"],
//     name: "Dropdown",
//     story: "Dropdown",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-input--input",
//     componentId: "general-input",
//     title: "general/Input",
//     kind: "general/Input",
//     tags: ["dev", "test"],
//     name: "Input",
//     story: "Input",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-message--message",
//     componentId: "general-message",
//     title: "general/Message",
//     kind: "general/Message",
//     tags: ["dev", "test"],
//     name: "Message",
//     story: "Message",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-modal--modal",
//     componentId: "general-modal",
//     title: "general/Modal",
//     kind: "general/Modal",
//     tags: ["dev", "test"],
//     name: "Modal",
//     story: "Modal",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-select-multipleselect--multiple-select",
//     componentId: "general-select-multipleselect",
//     title: "general/Select/MultipleSelect",
//     kind: "general/Select/MultipleSelect",
//     tags: ["dev", "test"],
//     name: "Multiple Select",
//     story: "Multiple Select",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-select-singleselect--single-select",
//     componentId: "general-select-singleselect",
//     title: "general/Select/SingleSelect",
//     kind: "general/Select/SingleSelect",
//     tags: ["dev", "test"],
//     name: "Single Select",
//     story: "Single Select",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "general-timepicker--time-picker",
//     componentId: "general-timepicker",
//     title: "general/TimePicker",
//     kind: "general/TimePicker",
//     tags: ["dev", "test"],
//     name: "Time Picker",
//     story: "Time Picker",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "dev-test-testnew--test-new",
//     componentId: "dev-test-testnew",
//     title: "dev-test/TestNew",
//     kind: "dev-test/TestNew",
//     tags: ["dev", "test"],
//     name: "Test New",
//     story: "Test New",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "dev-test-testremove--test-remove",
//     componentId: "dev-test-testremove",
//     title: "dev-test/TestRemove",
//     kind: "dev-test/TestRemove",
//     tags: ["dev", "test"],
//     name: "Test Remove",
//     story: "Test Remove",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "dev-test-testrename--test-rename",
//     componentId: "dev-test-testrename",
//     title: "dev-test/TestRename",
//     kind: "dev-test/TestRename",
//     tags: ["dev", "test"],
//     name: "Test Rename",
//     story: "Test Rename",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "dev-test-testresize--test-resize",
//     componentId: "dev-test-testresize",
//     title: "dev-test/TestResize",
//     kind: "dev-test/TestResize",
//     tags: ["dev", "test"],
//     name: "Test Resize",
//     story: "Test Resize",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "app-eventcard--event-card",
//     componentId: "app-eventcard",
//     title: "app/EventCard",
//     kind: "app/EventCard",
//     tags: ["dev", "test"],
//     name: "Event Card",
//     story: "Event Card",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
//   {
//     id: "app-tagcard--tag-card",
//     componentId: "app-tagcard",
//     title: "app/TagCard",
//     kind: "app/TagCard",
//     tags: ["dev", "test"],
//     name: "Tag Card",
//     story: "Tag Card",
//     state: StoryState.WAITING,
//     browserName: null,
//     startTime: null,
//     endTime: null,
//     storyErr: null,
//   },
// ];

interface SaveInfo {
  type: string;
  project: string;
  branch: string;
}

export const useScreenshotStore = defineStore("counter", () => {
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
    return _metadata.value.filter(item => item.state === StoryState.FAILED);
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
    storyTypeFilter.value = filter;
  };

  const updateDisplayingImg = async (id: string) => {
    displayingImg.value = { loading: true, isExist: null, base64: null };
    const result = await window.imgApi.getScreenshotImg(id);
    displayingImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  window.screenshotApi.onReceiveScreenshotInfo(params => {
    switch (params.type) {
      case "status":
        state.value = params.status;
        break;
      case "error":
        // todo
        console.log(params.error);
        break;
      case "new-metadata": {
        const storyMetadataInExplorer: StoryMetadataInExplorer[] = params.storyMetadataList.map((x: any) => ({
          id: x.id,
          componentId: x.componentId,
          title: x.title,
          kind: x.kind,
          tags: x.tags,
          name: x.name,
          story: x.story,
          state: StoryState.WAITING,
          browserName: null,
          startTime: null,
          endTime: null,
          storyErr: null,
        }));
        _metadata.value = storyMetadataInExplorer;
        break;
      }
      case "update-story-state": {
        const story = _metadata.value?.find(item => item.id === params.storyId);
        if (story) {
          story.state = params.state;
          story.browserName = params.browserName;
          if (params.storyErr !== null) {
            story.storyErr = params.storyErr;
          }
          if (params.state === StoryState.CAPTURING) {
            story.startTime = new Date().toISOString();
          } else if (params.state === StoryState.FINISHED) {
            story.endTime = new Date().toISOString();
          }
        }
        break;
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
