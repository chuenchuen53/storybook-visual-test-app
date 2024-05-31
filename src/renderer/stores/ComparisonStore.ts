import { defineStore } from "pinia";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useComparisonResultExplorer } from "../composables/useComparisonResultExplorer";
import { useComparisonImage } from "../composables/useComparisonImage";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";
import type { ComparisonRequest, GetAvailableSetResponse } from "../../shared/type";

export interface CompareSet {
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
  const availableSets = ref<GetAvailableSetResponse>({
    ref: [],
    test: [],
  });
  const refSet = ref<CompareSet>({
    branch: null,
    setId: null,
  });
  const testSet = ref<CompareSet>({
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
    name: "feature 123",
  });

  const compare = async () => {
    if (isComparing.value) return;
    if (!project.value || !refSet.value.branch || !refSet.value.setId || !testSet.value.branch || !testSet.value.setId)
      return;

    try {
      isComparing.value = true;
      const req: ComparisonRequest = {
        ref: { project: project.value, branch: refSet.value.branch, setId: refSet.value.setId },
        test: { project: project.value, branch: testSet.value.branch, setId: testSet.value.setId },
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
    availableSets.value = await window.comparisonApi.invoke.getAvailableSets(projectName);
    refSet.value = {
      branch: null,
      setId: null,
    };
    testSet.value = {
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
        ref: [],
        test: [],
      };
      refSet.value = {
        branch: null,
        setId: null,
      };
      testSet.value = {
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
      const oldRefBranch = refSet.value.branch;
      const oldTestBranch = testSet.value.branch;
      const oldRefSetId = refSet.value.setId;
      const oldTestSetId = testSet.value.setId;

      await updateProject(project.value, false);

      const oldRefBranchData = availableSets.value.ref.find(x => x.branch === oldRefBranch);
      if (oldRefBranchData) {
        refSet.value.branch = oldRefBranch;
        if (oldRefSetId && oldRefBranchData.setList.find(x => x.id === oldRefSetId)) {
          refSet.value.setId = oldRefSetId;
        }
      }

      const oldTestBranchData = availableSets.value.test.find(x => x.branch === oldTestBranch);
      if (oldTestBranchData) {
        testSet.value.branch = oldTestBranch;
        if (oldTestSetId && oldTestBranchData.setList.find(x => x.id === oldTestSetId)) {
          testSet.value.setId = oldTestSetId;
        }
      }
    }
  };

  const updateProjectsInTab = async (projects: string[]) => {
    await window.userSettingApi.invoke.updateProjectsInTab(projects);
    projectsInTab.value = projects;
    if (project.value && projects.includes(project.value)) return;
    if (projects.length > 0) {
      await updateProject(projects[0]);
    } else {
      project.value = null;
    }
  };

  const updateRefSetBranch = (x: string) => {
    if (x === refSet.value.branch) return;
    refSet.value.branch = x;
    refSet.value.setId = null;
  };

  const updateTestSetBranch = (x: string) => {
    if (x === testSet.value.branch) return;
    testSet.value.branch = x;
    testSet.value.setId = null;
  };

  const openInExplorer = () => {
    window.comparisonApi.send.openInExplorer();
  };

  const handleNodeSelect = async (data: ComparisonResultTreeLeaf) => {
    if (!comparisonSetSummary.value) return;
    const { project, refBranch, testBranch, refSetId, testSetId } = comparisonSetSummary.value;
    const getRefImgFn = () =>
      window.imgApi.invoke.getSavedImg({
        type: "reference",
        project,
        branch: refBranch,
        setId: refSetId,
        id: data.id,
      });
    const getTestImgFn = () =>
      window.imgApi.invoke.getSavedImg({
        type: "test",
        project,
        branch: testBranch,
        setId: testSetId,
        id: data.id,
      });
    const getDiffImgFn = () => window.imgApi.invoke.getCompareDiffImg(data.id);

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
      const result = await window.comparisonApi.invoke.saveComparisonResult(saveInfo.value.name);
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
    refSet,
    testSet,
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
