import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useStoryExplorer } from "../composables/useStoryExplorer";
import { useImage } from "../composables/useImage";
import { useComparisonResultExplorer } from "../composables/useComparisonResultExplorer";
import { useComparisonImage } from "../composables/useComparisonImage";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";
import type {
  ComparisonSavedInfo,
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteRefTestBranchRequest,
  DeleteRefTestSetRequest,
  OpenComparisonSetInExplorerRequest,
  OpenTestRefSetInExplorerRequest,
  RefTestSavedInfo,
  SavedSets,
  SaveScreenshotType,
  StoryScreenshotMetadata,
} from "../../shared/type";

type CurrentSelectedSet =
  | { type: SaveScreenshotType; data: RefTestSavedInfo }
  | {
      type: "comparison";
      data: ComparisonSavedInfo;
    }
  | null;

export const useSavedSetStore = defineStore("savedSet", () => {
  const _toast = useToast();

  const project = ref<string | null>(null);
  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);
  const _savedSets = ref<SavedSets | null>(null);
  const searchTextForSavedSets = ref<string>("");
  const currentSelectedSet = ref<CurrentSelectedSet>(null);

  const filteredSavedSets = computed<SavedSets | null>(() => {
    if (_savedSets.value === null) return null;
    const searchText = searchTextForSavedSets.value.trim().toLowerCase();
    if (searchText === "") return _savedSets.value;

    const getFilteredInfoForTestRef = (all: Record<string, Record<string, RefTestSavedInfo>>) => {
      const filteredData: Record<string, Record<string, RefTestSavedInfo>> = {};
      const entries = Object.entries(all);
      for (const [branch, infoMap] of entries) {
        if (branch.includes(searchText)) {
          filteredData[branch] = infoMap;
          continue;
        }

        const innerEntries = Object.entries(infoMap);
        const filtered = innerEntries.filter(
          ([_, info]) =>
            info.name.toLowerCase().includes(searchText) ||
            info.viewport.width.toString().includes(searchText) ||
            info.viewport.height.toString().includes(searchText),
        );
        if (filtered.length > 0) {
          filteredData[branch] = Object.fromEntries(filtered);
        }
      }
      return filteredData;
    };

    const getFilteredInfoForComparison = (all: ComparisonSavedInfo[]) => {
      return all.filter(
        info =>
          info.name.toLowerCase().includes(searchText) ||
          info.refBranch.toLowerCase().includes(searchText) ||
          info.testBranch.toLowerCase().includes(searchText) ||
          info.viewport.width.toString().includes(searchText) ||
          info.viewport.height.toString().includes(searchText),
      );
    };

    return {
      ref: getFilteredInfoForTestRef(_savedSets.value.ref),
      test: getFilteredInfoForTestRef(_savedSets.value.test),
      comparison: getFilteredInfoForComparison(_savedSets.value.comparison),
    };
  });

  const {
    searchText: refTestSearchText,
    storyTypeFilter: refTestStoryTypeFilter,
    highlightKey: refTestHighlightKey,
    expandedKeys: refTestExpandedKeys,
    treeData: refTestTreeData,
    reset: refTestReset,
    replaceBackingData: refTestReplaceBackingData,
    expandAll: refTestExpandAll,
    collapseAll: refTestCollapseAll,
  } = useStoryExplorer<StoryScreenshotMetadata>();
  const { imgState: refTestImgState, removeImg: refTestRemoveImg, updateImg: refTestUpdateImg } = useImage();

  const {
    treeData: comparisonTreeData,
    searchText: comparisonSearchText,
    typeOptions: comparisonTypeOptions,
    selectedType: comparisonSelectedType,
    highlightKey: comparisonHighlightKey,
    expandedKeys: comparisonExpandedKeys,
    reset: comparisonReset,
    replaceBackingData: comparisonReplaceBackingData,
    comparisonSetSummary: comparisonGetSetMetadata,
    expandAll: comparisonExpandAll,
    collapseAll: comparisonCollapseAll,
  } = useComparisonResultExplorer();
  const {
    comparisonImageState,
    resetImgs: resetComparisonImgs,
    setSameImg,
    setAddedImg,
    setRemovedImg,
    setDiffImg,
  } = useComparisonImage();
  const diffViewInVertical = ref(false);
  const showDiffImg = ref(false);

  const updateProject = async (x: string) => {
    project.value = x;
    _savedSets.value = null;
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
    _savedSets.value = await window.savedSetApi.invoke.getAllSavedSets(project.value);
  };

  const openRefTestSet = async (set: RefTestSavedInfo) => {
    currentSelectedSet.value = { type: set.type, data: set };
    const { type, project, branch, id } = set;
    const metadataList = await window.savedSetApi.invoke.getRefOrTestSavedSetMetadata({
      type,
      project,
      branch,
      setId: id,
    });
    refTestReplaceBackingData(metadataList);
  };

  const openComparisonSet = async (set: ComparisonSavedInfo) => {
    currentSelectedSet.value = { type: "comparison", data: set };
    const { data } = await window.savedSetApi.invoke.getComparisonSavedSetMetadata({
      project: set.project,
      setId: set.id,
    });
    if (!data) {
      _toast.add({ severity: "error", summary: "Error", detail: "Fail to get comparison set" });
      return;
    }
    comparisonReplaceBackingData(data.metadata, data.storyMetadataList);
  };

  const updateDisplayingImg = async (id: string) => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type === "comparison") return;
    const { project, branch, type, id: setId } = currentSelectedSet.value.data;
    await refTestUpdateImg(() =>
      window.imgApi.invoke.getSavedRefTestImg({
        type,
        project,
        branch,
        setId,
        id,
      }),
    );
  };

  const deselectSavedSet = async () => {
    currentSelectedSet.value = null;
    refTestReset();
    refTestRemoveImg();
  };

  const updateComparisonDisplayImg = async (data: ComparisonResultTreeLeaf) => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type !== "comparison") return;
    const { project, id, refBranch, testBranch, refSetId, testSetId } = currentSelectedSet.value.data;
    const getRefImgFn = () =>
      window.imgApi.invoke.getSavedRefTestImg({
        type: "reference",
        project,
        branch: refBranch,
        setId: refSetId,
        id: data.id,
      });
    const getTestImgFn = () =>
      window.imgApi.invoke.getSavedRefTestImg({
        type: "test",
        project,
        branch: testBranch,
        setId: testSetId,
        id: data.id,
      });
    const getDiffImgFn = () =>
      window.imgApi.invoke.getSavedComparisonDiffImg({
        project,
        setId: id,
        id: data.id,
      });

    switch (data.type) {
      case "same": {
        await setSameImg(getRefImgFn, getTestImgFn);
        return;
      }
      case "added": {
        await setAddedImg(getTestImgFn);
        return;
      }
      case "removed": {
        await setRemovedImg(getRefImgFn);
        return;
      }
      case "diff": {
        await setDiffImg(getRefImgFn, getTestImgFn, getDiffImgFn);
        return;
      }
    }
  };

  const openTestRefSetInExplorer = () => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type === "comparison") return;
    const { type, project, branch, id } = currentSelectedSet.value.data;
    const req: OpenTestRefSetInExplorerRequest = {
      type,
      project,
      branch,
      setId: id,
    };
    window.savedSetApi.send.openTestRefSetInExplorer(req);
  };

  const openComparisonSetInExplorer = () => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type !== "comparison") return;
    const { project, id } = currentSelectedSet.value.data;
    const req: OpenComparisonSetInExplorerRequest = { project, setId: id };
    window.savedSetApi.send.openComparisonSetInExplorer(req);
  };

  const onSuccessDelete = () => {
    _toast.add({ severity: "success", summary: "Success", detail: "Delete successfully", life: 5000 });
  };

  const onFailDelete = () => {
    _toast.add({ severity: "error", summary: "Error", detail: "Fail to delete", life: 5000 });
  };

  const deleteRefTestSet = async (set: RefTestSavedInfo) => {
    const req: DeleteRefTestSetRequest = {
      type: set.type,
      project: set.project,
      branch: set.branch,
      setId: set.id,
    };
    const result = await window.savedSetApi.invoke.deleteRefTestSet(req);
    if (result) {
      onSuccessDelete();
      _savedSets.value = result;
    } else {
      onFailDelete();
    }
  };

  const deleteComparisonSet = async (set: ComparisonSavedInfo) => {
    const req: DeleteComparisonSetRequest = {
      project: set.project,
      setId: set.id,
    };
    const result = await window.savedSetApi.invoke.deleteComparisonSet(req);
    if (result) {
      onSuccessDelete();
      _savedSets.value = result;
    } else {
      onFailDelete();
    }
  };

  const deleteRefTestBranch = async (type: SaveScreenshotType, branch: string) => {
    if (project.value === null) return;
    const req: DeleteRefTestBranchRequest = {
      type,
      project: project.value,
      branch,
    };
    const result = await window.savedSetApi.invoke.deleteRefTestBranch(req);
    if (result) {
      onSuccessDelete();
      _savedSets.value = result;
    } else {
      onFailDelete();
    }
  };

  const deleteProject = async () => {
    const localProject = project.value;
    if (!localProject) return;
    const req: DeleteProjectRequest = { project: localProject };
    const result = await window.savedSetApi.invoke.deleteProject(req);
    if (result) {
      onSuccessDelete();
      const newAllProjectsInTab = projectsInTab.value.filter(x => x !== localProject);
      await updateProjectsInTab(newAllProjectsInTab);
      await refreshData();
    } else {
      onFailDelete();
    }
  };

  return {
    project,
    availableProjects,
    projectsInTab,
    filteredSavedSets,
    searchTextForSavedSets,
    currentSelectedSet,
    refTestSearchText,
    refTestStoryTypeFilter,
    refTestHighlightKey,
    refTestExpandedKeys,
    refTestTreeData,
    refTestImgState,
    comparisonTreeData,
    comparisonSearchText,
    comparisonTypeOptions,
    comparisonSelectedType,
    comparisonHighlightKey,
    comparisonExpandedKeys,
    comparisonImageState,
    showDiffImg,
    diffViewInVertical,
    refTestExpandAll,
    refTestCollapseAll,
    comparisonExpandAll,
    comparisonCollapseAll,
    deselectSavedSet,
    refreshData,
    updateProject,
    updateProjectsInTab,
    getAllSavedSets,
    openRefTestSet,
    updateDisplayingImg,
    openComparisonSet,
    updateComparisonDisplayImg,
    openTestRefSetInExplorer,
    openComparisonSetInExplorer,
    deleteRefTestSet,
    deleteComparisonSet,
    deleteRefTestBranch,
    deleteProject,
  };
});
