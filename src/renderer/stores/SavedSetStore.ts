import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getScreenshotPageTreeData } from "../components/screenshot/story-explorer/helper";
import { generateTreeFromFlatData } from "../utils/story-tree-utils";
import { SaveScreenshotType } from "../../shared/type";
import type {
  ComparisonSavedInfo,
  RefTestSavedInfo,
  SavedSets,
  StoryMetadata,
  StoryScreenshotMetadata,
} from "../../shared/type";

type SavedRefData = {
  branches: null | string[];
  setInfo: null | RefTestSavedInfo[];
};

type SavedTestData = SavedRefData;

type CurrentSelectedSet = RefTestSavedInfo | ComparisonSavedInfo | null;

export const useSavedSetStore = defineStore("savedSet", () => {
  const project = ref<string | null>(null);
  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);

  const savedRefData = ref<SavedRefData>({
    branches: null,
    setInfo: null,
  });
  const savedTestData = ref<SavedTestData>({
    branches: null,
    setInfo: null,
  });

  const currentSelectedSet = ref<CurrentSelectedSet>(null);

  const currentSelectedSetType = computed<"compare" | "test" | "ref">(() => {
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
      : getScreenshotPageTreeData(generateTreeFromFlatData(_filteredStoryMetadataList.value));
  });

  const displayingImg = ref<{ loading: boolean; isExist: boolean | null; base64: string | null }>({
    loading: false,
    isExist: null,
    base64: null,
  });

  const savedSets = ref<SavedSets | null>(null);

  const updateProject = async (x: string) => {
    project.value = x;
    currentSelectedSet.value = null;
    savedSets.value = null;
    _currentSelectedRefTestStoryMetadataList.value = null;
    await getAllSavedSets();
  };

  const refreshData = async () => {
    availableProjects.value = await window.compareApi.getAvailableProjects();
    projectsInTab.value = await window.userSettingApi.getProjectsInTab();

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
      // todo
    }
  };

  const updateProjectsInTab = async (projects: string[]) => {
    const success = await window.userSettingApi.updateProjectsInTab(projects);
    if (success) {
      projectsInTab.value = projects;
    }
    projectsInTab.value = projects;
  };

  const getAllRefBranches = async () => {
    const branches = await window.savedSetApi.getAllRefOrTestBranches("reference", project.value);
    savedRefData.value.branches = branches;
    savedRefData.value.setInfo = null;
  };

  const getAllRefSetInfo = async (branch: string | null) => {
    console.log("call me");
    if (branch === null) {
      savedRefData.value.setInfo = null;
    } else {
      const info = await window.savedSetApi.getAllRefOrTestSavedSets("reference", project.value, branch);
      savedRefData.value.setInfo = info;
    }
  };

  const getAllTestBranches = async () => {
    const branches = await window.savedSetApi.getAllRefOrTestBranches("test", project.value);
    savedTestData.value.branches = branches;
    savedTestData.value.setInfo = null;
  };

  const getAllTestSetInfo = async (branch: string | null) => {
    if (branch === null) {
      savedTestData.value.setInfo = null;
    } else {
      const info = await window.savedSetApi.getAllRefOrTestSavedSets("test", project.value, branch);
      savedTestData.value.setInfo = info;
    }
  };

  const getAllSavedSets = async () => {
    if (project.value === null) return;
    savedSets.value = await window.savedSetApi.getAllSavedSets(project.value);
  };

  const openRefTestSet = async (set: RefTestSavedInfo) => {
    currentSelectedSet.value = set;
    _currentSelectedRefTestStoryMetadataList.value = await window.savedSetApi.getRefOrTestSavedSetMetadata(
      set.type,
      set.project,
      set.branch,
      set.id,
    );
  };

  const updateDisplayingImg = async (id: string) => {
    if (
      currentSelectedSet.value === null ||
      currentSelectedSetType.value === null ||
      currentSelectedSetType.value === "compare"
    )
      return;

    displayingImg.value = { loading: true, isExist: null, base64: null };
    const { project, branch, type, id: setId } = currentSelectedSet.value;
    console.log(currentSelectedSet.value);
    console.log(project, branch, type, setId, id);
    const result = await window.imgApi.getSavedImg(type, project, branch, setId, id);
    displayingImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  return {
    project,
    availableProjects,
    projectsInTab,
    savedRefData,
    savedTestData,
    savedSets,
    explorerTreeData,
    currentSelectedSet,
    currentSelectedSetType,
    expandedKeys,
    selectedKey,
    displayingImg,
    refreshData,
    updateProject,
    updateProjectsInTab,
    getAllRefBranches,
    getAllRefSetInfo,
    getAllTestBranches,
    getAllTestSetInfo,
    getAllSavedSets,
    openRefTestSet,
    updateDisplayingImg,
  };
});
