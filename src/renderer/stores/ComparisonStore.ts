import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import {
  generateTreeFromRespData,
  getCompareResultTreeData,
} from "../components/comparison/comparison-result-explorer/helper";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";
import type {
  ComparisonRequest,
  ComparisonResponse$Data,
  GetAvailableSetResponse,
  StoriesDiffResult,
  StoryScreenshotMetadata,
} from "../../shared/type";

export interface CompareSet {
  branch: string | null;
  setId: string | null;
}

export interface ImgState {
  loading: boolean;
  isExist: boolean | null;
  base64: string | null;
}

export interface TypeOptions {
  same: number;
  diff: number;
  added: number;
  removed: number;
}

export interface DisplayingImg {
  type: keyof StoriesDiffResult;
  ref: ImgState;
  test: ImgState;
  diff: ImgState;
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

  const _compareResult = ref<null | ComparisonResponse$Data>(null);
  const _storyMetadataMap = ref(new Map<string, StoryScreenshotMetadata>());
  const isComparing = ref(false);
  const expandedKeys = ref(new Set<string>());
  const highlightKey = ref<null | string>(null);
  const selectedKey = ref<null | string>(null);
  const searchText = ref("");
  const typeOptions = ref<null | TypeOptions>(null);
  const selectedType = ref<"diff" | "added" | "removed" | "same">("diff");
  const displayingImg = ref<DisplayingImg | null>(null);
  const diffViewInVertical = ref(false);
  const showDiffImg = ref(false);

  const _compareResultForTree = computed<null | Record<keyof StoriesDiffResult, ComparisonResultTreeLeaf[]>>(() => {
    if (_compareResult.value === null) return null;
    const result: Record<keyof StoriesDiffResult, ComparisonResultTreeLeaf[]> = {
      diff: [],
      added: [],
      removed: [],
      same: [],
    };
    const localResult = _compareResult.value?.result;
    if (!localResult) return result;

    const keys: (keyof StoriesDiffResult)[] = ["diff", "added", "removed", "same"];
    for (const key of keys) {
      for (const id of localResult[key]) {
        const data = _storyMetadataMap.value.get(id);
        if (data) {
          result[key].push({ ...data, type: key });
        }
      }
    }

    return result;
  });

  const explorerTreeData = computed(() => {
    return _compareResultForTree.value === null
      ? null
      : getCompareResultTreeData(generateTreeFromRespData(_compareResultForTree.value, selectedType.value));
  });

  const expandAll = () => {
    if (!explorerTreeData.value) return;
    const allKeys = explorerTreeData.value.map(node => getAllNonLeafKeys(node)).flat();
    for (const key of allKeys) {
      expandedKeys.value.add(key);
    }
  };

  const collapseAll = () => {
    expandedKeys.value.clear();
  };

  const saveDialogOpen = ref(false);
  const isSaving = ref(false);
  const saveInfo = ref<SaveInfo>({
    name: "feature abc",
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
        _compareResult.value = data;
        _storyMetadataMap.value.clear();
        for (const x of storyMetadataList) {
          _storyMetadataMap.value.set(x.id, x);
        }
        expandedKeys.value.clear();
        highlightKey.value = null;
        selectedType.value = "diff";
        typeOptions.value = {
          same: data.result.same.length,
          diff: data.result.diff.length,
          added: data.result.added.length,
          removed: data.result.removed.length,
        };
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

    availableProjects.value = _availableProjects;
    projectsInTab.value = _projectsInTab;

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
      displayingImg.value = null;

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
  };

  const refSet = ref<CompareSet>({
    branch: null,
    setId: null,
  });

  const testSet = ref<CompareSet>({
    branch: null,
    setId: null,
  });

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

  const updateRefSetId = (x: string) => {
    refSet.value.setId = x;
  };

  const updateTestSetId = (x: string) => {
    testSet.value.setId = x;
  };

  const openInExplorer = () => {
    window.comparisonApi.send.openInExplorer();
  };

  const handleNodeSelect = async (data: ComparisonResultTreeLeaf) => {
    if (!_compareResult.value) return;
    const { project, refBranch, refSetId, testBranch, testSetId } = _compareResult.value;
    switch (data.type) {
      case "same": {
        displayingImg.value = {
          type: "same",
          ref: { loading: true, isExist: null, base64: null },
          test: { loading: true, isExist: null, base64: null },
          diff: { loading: false, isExist: null, base64: null },
        };
        const [refImg, testImg] = await Promise.all([
          window.imgApi.invoke.getSavedImg({
            type: "reference",
            project,
            branch: refBranch,
            setId: refSetId,
            id: data.id,
          }),
          window.imgApi.invoke.getSavedImg({
            type: "test",
            project,
            branch: testBranch,
            setId: testSetId,
            id: data.id,
          }),
        ]);
        displayingImg.value.ref = {
          loading: false,
          isExist: refImg.isExist,
          base64: refImg.base64,
        };
        displayingImg.value.test = {
          loading: false,
          isExist: testImg.isExist,
          base64: testImg.base64,
        };
        return;
      }
      case "added": {
        displayingImg.value = {
          type: "added",
          ref: { loading: false, isExist: null, base64: null },
          test: { loading: true, isExist: null, base64: null },
          diff: { loading: false, isExist: null, base64: null },
        };
        const testImg = await window.imgApi.invoke.getSavedImg({
          type: "test",
          project,
          branch: testBranch,
          setId: testSetId,
          id: data.id,
        });
        displayingImg.value.test = {
          loading: false,
          isExist: testImg.isExist,
          base64: testImg.base64,
        };
        return;
      }
      case "removed": {
        displayingImg.value = {
          type: "removed",
          ref: { loading: true, isExist: null, base64: null },
          test: { loading: false, isExist: null, base64: null },
          diff: { loading: false, isExist: null, base64: null },
        };
        const refImg = await window.imgApi.invoke.getSavedImg({
          type: "reference",
          project,
          branch: refBranch,
          setId: refSetId,
          id: data.id,
        });
        displayingImg.value.ref = {
          loading: false,
          isExist: refImg.isExist,
          base64: refImg.base64,
        };
        return;
      }
      case "diff": {
        displayingImg.value = {
          type: "diff",
          ref: { loading: true, isExist: null, base64: null },
          test: { loading: true, isExist: null, base64: null },
          diff: { loading: true, isExist: null, base64: null },
        };
        const [refImg, testImg, diffImg] = await Promise.all([
          window.imgApi.invoke.getSavedImg({
            type: "reference",
            project,
            branch: refBranch,
            setId: refSetId,
            id: data.id,
          }),
          window.imgApi.invoke.getSavedImg({
            type: "test",
            project,
            branch: testBranch,
            setId: testSetId,
            id: data.id,
          }),
          window.imgApi.invoke.getCompareDiffImg(data.id),
        ]);
        displayingImg.value.ref = {
          loading: false,
          isExist: refImg.isExist,
          base64: refImg.base64,
        };
        displayingImg.value.test = {
          loading: false,
          isExist: testImg.isExist,
          base64: testImg.base64,
        };
        displayingImg.value.diff = {
          loading: false,
          isExist: diffImg.isExist,
          base64: diffImg.base64,
        };
        return;
      }
    }
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
    explorerTreeData,
    highlightKey,
    expandedKeys,
    selectedKey,
    isSaving,
    saveDialogOpen,
    searchText,
    typeOptions,
    projectsInTab,
    selectedType,
    saveInfo,
    displayingImg,
    diffViewInVertical,
    showDiffImg,
    updateProject,
    compare,
    refreshData,
    updateRefSetBranch,
    updateTestSetBranch,
    updateRefSetId,
    updateTestSetId,
    openInExplorer,
    handleNodeSelect,
    saveScreenshot,
    expandAll,
    collapseAll,
    updateProjectsInTab,
  };
});
