import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useComparisonResultExplorer } from "../composables/useComparisonResultExplorer";
import { useComparisonImage } from "../composables/useComparisonImage";
import type { ComparisonResultTreeLeaf } from "../components/shared/comparison-result-explorer/helper";
import type { CreateNewComparisonSetRequest, GetAllSavedScreenshotSetsResponse } from "../../shared/type";

export interface SelectedSet {
  branch: string | null;
  setId: string | null;
}

export interface SaveInfo {
  name: string;
}

export const useComparisonStore = defineStore("comparison", () => {
  const _toast = useToast();

  const project = ref<string | null>(null);
  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);
  const availableSets = ref<GetAllSavedScreenshotSetsResponse>({
    screenshot: {},
  });
  const selectedRefSet = ref<SelectedSet>({
    branch: null,
    setId: null,
  });
  const selectedTestSet = ref<SelectedSet>({
    branch: null,
    setId: null,
  });

  const isComparing = ref(false);
  const diffViewInVertical = ref(false);
  const showDiffImg = ref(false);

  const {
    treeData,
    searchText,
    typeOptions,
    selectedType,
    highlightKey,
    expandedKeys,
    isNullResult,
    comparisonSetSummary,
    reset: resetExplorerData,
    replaceBackingData,
    expandAll,
    collapseAll,
  } = useComparisonResultExplorer();

  const { comparisonImageState, resetImgs, setSameImg, setAddedImg, setRemovedImg, setDiffImg } = useComparisonImage();

  const saveDialogOpen = ref(false);
  const isSaving = ref(false);
  const saveInfo = ref<SaveInfo>({
    name: "",
  });

  const compare = async () => {
    if (isComparing.value) return;
    if (
      !project.value ||
      !selectedRefSet.value.branch ||
      !selectedRefSet.value.setId ||
      !selectedTestSet.value.branch ||
      !selectedTestSet.value.setId
    )
      return;

    try {
      isComparing.value = true;
      const req: CreateNewComparisonSetRequest = {
        ref: { project: project.value, branch: selectedRefSet.value.branch, setId: selectedRefSet.value.setId },
        test: { project: project.value, branch: selectedTestSet.value.branch, setId: selectedTestSet.value.setId },
      };
      const { success, data, storyMetadataList } = await window.comparisonApi.invoke.compare(req);

      if (success && data && storyMetadataList) {
        replaceBackingData(data, storyMetadataList);
        selectedType.value = "diff";
        _toast.add({
          severity: "success",
          summary: "Success",
          detail: "Successfully compared",
          life: 5000,
        });
      } else {
        _toast.add({
          severity: "error",
          summary: "Error",
          detail: "Fail to compare",
          life: 5000,
        });
      }
    } finally {
      isComparing.value = false;
    }
  };

  const updateProject = async (projectName: string, skipIfSame = true) => {
    if (skipIfSame && projectName === project.value) return;

    project.value = projectName;
    availableSets.value = await window.savedSetApi.invoke.getAllSavedScreenshotSets(projectName);
    selectedRefSet.value = {
      branch: null,
      setId: null,
    };
    selectedTestSet.value = {
      branch: null,
      setId: null,
    };
  };

  const refreshData = async () => {
    const [_availableProjects, _projectsInTab] = await Promise.all([
      window.savedSetApi.invoke.getAllSavedProjects(),
      window.userSettingApi.invoke.getProjectsInTab(),
    ]);

    const filteredProjects = _projectsInTab.filter(x => _availableProjects.includes(x));
    if (filteredProjects.length !== _projectsInTab.length) {
      void updateProjectsInTab(filteredProjects);
    }

    availableProjects.value = _availableProjects;
    projectsInTab.value = filteredProjects;

    if (projectsInTab.value.length === 0) {
      project.value = null;
      availableSets.value = {
        screenshot: {},
      };
      selectedRefSet.value = {
        branch: null,
        setId: null,
      };
      selectedTestSet.value = {
        branch: null,
        setId: null,
      };
      resetImgs();

      return;
    }

    if (!project.value || !availableProjects.value.includes(project.value)) {
      const firstProject = projectsInTab.value[0];
      if (availableProjects.value.includes(firstProject)) {
        await updateProject(firstProject);
      }
      return;
    }

    if (
      project.value &&
      projectsInTab.value.includes(project.value) &&
      availableProjects.value.includes(project.value)
    ) {
      const oldRefBranch = selectedRefSet.value.branch;
      const oldTestBranch = selectedTestSet.value.branch;
      const oldRefSetId = selectedRefSet.value.setId;
      const oldTestSetId = selectedTestSet.value.setId;

      await updateProject(project.value, false);

      const oldRefBranchData = oldRefBranch ? availableSets.value.screenshot[oldRefBranch] : null;
      if (oldRefBranchData) {
        selectedRefSet.value.branch = oldRefBranch;
        if (oldRefSetId && oldRefBranchData[oldRefSetId]) {
          selectedRefSet.value.setId = oldRefSetId;
        }
      }

      const oldTestBranchData = oldTestBranch ? availableSets.value.screenshot[oldTestBranch] : null;
      if (oldTestBranchData) {
        selectedTestSet.value.branch = oldTestBranch;
        if (oldTestSetId && oldTestBranchData[oldTestSetId]) {
          selectedTestSet.value.setId = oldTestSetId;
        }
      }
    }
  };

  const updateProjectsInTab = async (projects: string[]) => {
    await window.userSettingApi.invoke.setProjectsInTab(projects);
    projectsInTab.value = projects;
    if (project.value && projects.includes(project.value)) return;
    if (projects.length > 0) {
      await updateProject(projects[0]);
    } else {
      project.value = null;
    }
  };

  const updateRefSetBranch = (x: string) => {
    if (x === selectedRefSet.value.branch) return;
    selectedRefSet.value.branch = x;
    selectedRefSet.value.setId = null;
  };

  const updateTestSetBranch = (x: string) => {
    if (x === selectedTestSet.value.branch) return;
    selectedTestSet.value.branch = x;
    selectedTestSet.value.setId = null;
  };

  const openInExplorer = () => {
    window.comparisonApi.send.openInExplorer();
  };

  const handleNodeSelect = async (data: ComparisonResultTreeLeaf) => {
    if (!comparisonSetSummary.value) return;
    const { project, refBranch, testBranch, refSetId, testSetId } = comparisonSetSummary.value;
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
    const getDiffImgFn = () => window.imgApi.invoke.getTempComparisonDiffImg(data.id);

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

  const removeCurrentResult = () => {
    resetExplorerData();
    resetImgs();
  };

  const saveScreenshot = async () => {
    try {
      isSaving.value = true;
      const result = await window.comparisonApi.invoke.save(saveInfo.value.name);
      if (result.success) {
        _toast.add({
          severity: "success",
          summary: "Success",
          detail: "Successfully saved the comparison result",
          life: 5000,
        });
        saveDialogOpen.value = false;
      } else {
        _toast.add({
          severity: "error",
          summary: "Error",
          detail: "Fail to saved the comparison result",
          life: 5000,
        });
        console.error(result.errMsg);
      }
    } finally {
      isSaving.value = false;
    }
  };

  return {
    isComparing,
    project,
    availableProjects,
    availableSets,
    selectedRefSet,
    selectedTestSet,
    treeData,
    highlightKey,
    expandedKeys,
    isSaving,
    saveDialogOpen,
    searchText,
    typeOptions,
    projectsInTab,
    selectedType,
    saveInfo,
    diffViewInVertical,
    comparisonImageState,
    showDiffImg,
    isNullResult,
    comparisonSetSummary,
    updateProject,
    compare,
    refreshData,
    updateRefSetBranch,
    updateTestSetBranch,
    openInExplorer,
    handleNodeSelect,
    saveScreenshot,
    expandAll,
    collapseAll,
    updateProjectsInTab,
    removeCurrentResult,
  };
});
