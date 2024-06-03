import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useStoryExplorer } from "../composables/useStoryExplorer";
import { useImage } from "../composables/useImage";
import { useComparisonResultExplorer } from "../composables/useComparisonResultExplorer";
import { useComparisonImage } from "../composables/useComparisonImage";
import type { ComparisonResultTreeLeaf } from "../components/shared/comparison-result-explorer/helper";
import type {
  SavedComparisonInfo,
  DeleteComparisonSetRequest,
  DeleteProjectRequest,
  DeleteScreenshotBranchRequest,
  DeleteScreenshotSetRequest,
  OpenComparisonSetInExplorerRequest,
  OpenScreenshotSetInExplorerRequest,
  SavedScreenshotSetInfo,
  GetAllSavedSetsResponse,
  StoryMetadataWithRenderStatus,
} from "../../shared/type";

type CurrentSelectedSet =
  | { type: "screenshot"; data: SavedScreenshotSetInfo }
  | {
      type: "comparison";
      data: SavedComparisonInfo;
    }
  | null;

export const useSavedSetStore = defineStore("savedSet", () => {
  const _toast = useToast();

  const project = ref<string | null>(null);
  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);
  const _savedSets = ref<GetAllSavedSetsResponse | null>(null);
  const searchTextForSavedSets = ref<string>("");
  const currentSelectedSet = ref<CurrentSelectedSet>(null);

  const filteredSavedSets = computed<GetAllSavedSetsResponse | null>(() => {
    if (_savedSets.value === null) return null;
    const searchText = searchTextForSavedSets.value.trim().toLowerCase();
    if (searchText === "") return _savedSets.value;

    const getFilteredInfoForScreenshot = (all: Record<string, Record<string, SavedScreenshotSetInfo>>) => {
      const filteredData: Record<string, Record<string, SavedScreenshotSetInfo>> = {};
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

    const getFilteredInfoForComparison = (all: SavedComparisonInfo[]) => {
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
      screenshot: getFilteredInfoForScreenshot(_savedSets.value.screenshot),
      comparison: getFilteredInfoForComparison(_savedSets.value.comparison),
    };
  });

  const {
    searchText: screenshotSearchText,
    storyTypeFilter: screenshotStoryTypeFilter,
    highlightKey: screenshotHighlightKey,
    expandedKeys: screenshotExpandedKeys,
    treeData: screenshotTreeData,
    reset: screenshotReset,
    replaceBackingData: screenshotReplaceBackingData,
    expandAll: screenshotExpandAll,
    collapseAll: screenshotCollapseAll,
  } = useStoryExplorer<StoryMetadataWithRenderStatus>();
  const { imgState: screenshotImgState, removeImg: screenshotRemoveImg, updateImg: screenshotUpdateImg } = useImage();

  const {
    treeData: comparisonTreeData,
    searchText: comparisonSearchText,
    typeOptions: comparisonTypeOptions,
    selectedType: comparisonSelectedType,
    highlightKey: comparisonHighlightKey,
    expandedKeys: comparisonExpandedKeys,
    reset: comparisonReset,
    replaceBackingData: comparisonReplaceBackingData,
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

  const openScreenshotSet = async (set: SavedScreenshotSetInfo) => {
    currentSelectedSet.value = { type: "screenshot", data: set };
    const { project, branch, id } = set;
    const resp = await window.savedSetApi.invoke.getSavedScreenshotMetadata({
      project,
      branch,
      setId: id,
    });
    if (!resp.data) {
      _toast.add({ severity: "error", summary: "Error", detail: "Fail to get screenshot set" });
      return;
    }
    screenshotReplaceBackingData(resp.data.storyMetadataList);
  };

  const openComparisonSet = async (set: SavedComparisonInfo) => {
    currentSelectedSet.value = { type: "comparison", data: set };
    const { data } = await window.savedSetApi.invoke.getSavedComparisonMetadata({
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
    const { project, branch, id: setId } = currentSelectedSet.value.data;
    await screenshotUpdateImg(() =>
      window.imgApi.invoke.getSavedScreenshotImg({
        project,
        branch,
        setId,
        id,
      }),
    );
  };

  const deselectSavedSet = async () => {
    currentSelectedSet.value = null;
    screenshotReset();
    screenshotRemoveImg();
    comparisonReset();
    resetComparisonImgs();
  };

  const updateComparisonDisplayImg = async (data: ComparisonResultTreeLeaf) => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type !== "comparison") return;
    const { project, id, refBranch, testBranch, refSetId, testSetId } = currentSelectedSet.value.data;
    const getRefImgFn = () =>
      window.imgApi.invoke.getSavedScreenshotImg({
        project,
        branch: refBranch,
        setId: refSetId,
        id: data.id,
      });
    const getTestImgFn = () =>
      window.imgApi.invoke.getSavedScreenshotImg({
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

  const openScreenshotSetInExplorer = () => {
    if (currentSelectedSet.value === null || currentSelectedSet.value.type === "comparison") return;
    const { project, branch, id } = currentSelectedSet.value.data;
    const req: OpenScreenshotSetInExplorerRequest = {
      project,
      branch,
      setId: id,
    };
    window.savedSetApi.send.openScreenshotSetInExplorer(req);
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

  const deleteScreenshotSet = async (set: SavedScreenshotSetInfo) => {
    const req: DeleteScreenshotSetRequest = {
      project: set.project,
      branch: set.branch,
      setId: set.id,
    };
    const result = await window.savedSetApi.invoke.deleteScreenshotSet(req);
    if (result) {
      onSuccessDelete();
      _savedSets.value = result;
    } else {
      onFailDelete();
    }
  };

  const deleteComparisonSet = async (set: SavedComparisonInfo) => {
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

  const deleteScreenshotBranch = async (branch: string) => {
    if (project.value === null) return;
    const req: DeleteScreenshotBranchRequest = {
      project: project.value,
      branch,
    };
    const result = await window.savedSetApi.invoke.deleteScreenshotBranch(req);
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
    screenshotSearchText,
    screenshotStoryTypeFilter,
    screenshotHighlightKey,
    screenshotExpandedKeys,
    screenshotTreeData,
    screenshotImgState,
    comparisonTreeData,
    comparisonSearchText,
    comparisonTypeOptions,
    comparisonSelectedType,
    comparisonHighlightKey,
    comparisonExpandedKeys,
    comparisonImageState,
    showDiffImg,
    diffViewInVertical,
    screenshotExpandAll,
    screenshotCollapseAll,
    comparisonExpandAll,
    comparisonCollapseAll,
    deselectSavedSet,
    refreshData,
    updateProject,
    updateProjectsInTab,
    getAllSavedSets,
    openScreenshotSet,
    updateDisplayingImg,
    openComparisonSet,
    updateComparisonDisplayImg,
    openScreenshotSetInExplorer,
    openComparisonSetInExplorer,
    deleteScreenshotSet,
    deleteComparisonSet,
    deleteScreenshotBranch,
    deleteProject,
  };
});
