import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { getSavedSetPageTreeData, getScreenshotPageTreeData } from "../components/screenshot/story-explorer/helper";
import { generateTreeFromFlatData } from "../utils/story-tree-utils";
import {
  generateTreeFromRespData,
  getCompareResultTreeData,
} from "../components/comparison/comparison-result-explorer/helper";
import type {
  ComparisonSavedInfo,
  RefTestSavedInfo,
  SavedComparisonMetadata,
  SavedSets,
  StoriesDiffResult,
  StoryScreenshotMetadata,
} from "../../shared/type";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";

type CurrentSelectedSet = RefTestSavedInfo | ComparisonSavedInfo | null;

export interface DisplayingImg {
  type: keyof StoriesDiffResult;
  ref: ImgState;
  test: ImgState;
  diff: ImgState;
}

interface ImgState {
  loading: boolean;
  isExist: boolean | null;
  base64: string | null;
}

export const useSavedSetStore = defineStore("savedSet", () => {
  const _toast = useToast();

  const project = ref<string | null>(null);
  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);
  const savedSets = ref<SavedSets | null>(null);

  const currentSelectedSet = ref<CurrentSelectedSet>(null);

  const currentSelectedSetType = computed<"compare" | "test" | "ref" | null>(() => {
    if (currentSelectedSet.value === null) return null;
    if ("refBranch" in currentSelectedSet.value) return "compare";
    if (currentSelectedSet.value.type === "reference") return "ref";
    return "test";
  });

  const _currentSelectedRefTestStoryMetadataList = ref<StoryScreenshotMetadata[] | null>(null);
  const refTestStoryTypeFilter = ref<"all" | "error">("all");
  const searchText = ref("");
  const expandedKeys = ref(new Set<string>());
  const selectedKey = ref<string | null>(null);

  const _filteredStoryMetadataList = computed(() => {
    if (_currentSelectedRefTestStoryMetadataList.value === null) return null;
    const arr =
      refTestStoryTypeFilter.value === "all"
        ? _currentSelectedRefTestStoryMetadataList.value
        : _currentSelectedRefTestStoryMetadataList.value.filter(item => item.storyErr);
    return searchText.value
      ? arr.filter(item => {
          const lowerCaseSearchText = searchText.value.toLowerCase();
          return (
            item.title.toLowerCase().includes(lowerCaseSearchText) ||
            item.name.toLowerCase().includes(lowerCaseSearchText)
          );
        })
      : arr;
  });

  const explorerTreeData = computed(() => {
    return _filteredStoryMetadataList.value === null
      ? []
      : getSavedSetPageTreeData(generateTreeFromFlatData(_filteredStoryMetadataList.value));
  });

  const displayingImg = ref<ImgState>({
    loading: false,
    isExist: null,
    base64: null,
  });

  const _currentSelectedComparisonMetadata = ref<SavedComparisonMetadata | null>(null);
  const _currentSelectedComparisonStoryMetadataMap = ref(new Map<string, StoryScreenshotMetadata>());
  const comparisonDisplayingImg = ref<DisplayingImg | null>(null);
  const selectedComparisonResultType = ref<"diff" | "added" | "removed" | "same">("diff");

  const _compareResultForTree = computed<null | Record<keyof StoriesDiffResult, ComparisonResultTreeLeaf[]>>(() => {
    if (_currentSelectedComparisonMetadata.value === null) return null;
    const result: Record<keyof StoriesDiffResult, ComparisonResultTreeLeaf[]> = {
      diff: [],
      added: [],
      removed: [],
      same: [],
    };
    const localResult = _currentSelectedComparisonMetadata.value?.result;
    if (!localResult) return result;

    const keys: (keyof StoriesDiffResult)[] = ["diff", "added", "removed", "same"];
    for (const key of keys) {
      for (const id of localResult[key]) {
        const data = _currentSelectedComparisonStoryMetadataMap.value.get(id);
        if (data) {
          result[key].push({ ...data, type: key });
        }
      }
    }

    return result;
  });

  const comparisonExplorerTreeData = computed(() => {
    return _compareResultForTree.value === null
      ? null
      : getCompareResultTreeData(
          generateTreeFromRespData(_compareResultForTree.value, selectedComparisonResultType.value),
        );
  });

  const updateProject = async (x: string) => {
    project.value = x;
    currentSelectedSet.value = null;
    savedSets.value = null;
    _currentSelectedRefTestStoryMetadataList.value = null;
    displayingImg.value = { loading: false, isExist: null, base64: null };
    await getAllSavedSets();
  };

  const refreshData = async () => {
    const [_availableProjects, _projectsInTab] = await Promise.all([
      window.savedSetApi.invoke.getAllSavedProjects(),
      window.userSettingApi.invoke.getProjectsInTab(),
    ]);
    availableProjects.value = _availableProjects;
    projectsInTab.value = _projectsInTab;

    if (projectsInTab.value.length === 0) {
      project.value = null;
      return;
    }

    if (!project.value || !availableProjects.value.includes(project.value)) {
      const firstProject = projectsInTab.value[0];
      if (availableProjects.value.includes(firstProject)) {
        await updateProject(firstProject);
      }
    } else if (
      project.value &&
      projectsInTab.value.includes(project.value) &&
      availableProjects.value.includes(project.value)
    ) {
      await updateProject(project.value);
    }
  };

  const updateProjectsInTab = async (projects: string[]) => {
    await window.userSettingApi.invoke.updateProjectsInTab(projects);
    projectsInTab.value = projects;
  };

  const getAllSavedSets = async () => {
    if (project.value === null) return;
    savedSets.value = await window.savedSetApi.invoke.getAllSavedSets(project.value);
  };

  const openRefTestSet = async (set: RefTestSavedInfo) => {
    currentSelectedSet.value = set;
    const { type, project, branch, id } = set;
    _currentSelectedRefTestStoryMetadataList.value = await window.savedSetApi.invoke.getRefOrTestSavedSetMetadata({
      type,
      project,
      branch,
      setId: id,
    });
  };

  const openComparisonSet = async (set: ComparisonSavedInfo) => {
    currentSelectedSet.value = set;
    const { data } = await window.savedSetApi.invoke.getComparisonSavedSetMetadata({
      project: set.project,
      setId: set.id,
    });
    console.log("data", data);
    if (!data) {
      _toast.add({ severity: "error", summary: "Error", detail: "Fail to get comparison set" });
      return;
    }
    _currentSelectedComparisonMetadata.value = data.metadata;
    _currentSelectedComparisonStoryMetadataMap.value.clear();
    for (const item of data.storyMetadataList) {
      _currentSelectedComparisonStoryMetadataMap.value.set(item.id, item);
    }
  };

  const updateDisplayingImg = async (id: string) => {
    if (
      currentSelectedSet.value === null ||
      currentSelectedSetType.value === null ||
      "testBranch" in currentSelectedSet.value ||
      currentSelectedSetType.value === "compare"
    )
      return;
    displayingImg.value = { loading: true, isExist: null, base64: null };
    const { project, branch, type, id: setId } = currentSelectedSet.value;
    const result = await window.imgApi.invoke.getSavedImg({ type, project, branch, setId, id });
    displayingImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  const deselectSavedSet = async () => {
    currentSelectedSet.value = null;
    _currentSelectedRefTestStoryMetadataList.value = null;
    displayingImg.value = { loading: false, isExist: null, base64: null };
  };

  const updateComparisonDisplayImg = (data: ComparisonResultTreeLeaf) => {
    window.alert("todo: select" + data.id);
  };

  return {
    project,
    availableProjects,
    projectsInTab,
    savedSets,
    explorerTreeData,
    currentSelectedSet,
    currentSelectedSetType,
    expandedKeys,
    selectedKey,
    imgState,
    comparisonDisplayingImg,
    selectedComparisonResultType,
    comparisonExplorerTreeData,
    deselectSavedSet,
    refreshData,
    updateProject,
    updateProjectsInTab,
    getAllSavedSets,
    openRefTestSet,
    updateDisplayingImg,
    openComparisonSet,
    updateComparisonDisplayImg,
  };
});
