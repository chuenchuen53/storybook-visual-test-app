import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import {
  generateTreeFromRespData,
  getCompareResultTreeData,
} from "../components/compare/comparison-result-explorer/helper";
import { getAllNonLeafKeys } from "../components/general/tree/tree-helper";
import type { CompareResponse$Data, GetAvailableSetResponse } from "../../shared/type";

interface CompareSet {
  branch: string | null;
  uuid: string | null;
}

interface ImgState {
  loading: boolean;
  isExist: boolean | null;
  base64: string | null;
}

interface TypeOptions {
  same: number;
  diff: number;
  added: number;
  removed: number;
}

type CurrentDisplayingImgType = "same" | "added" | "removed" | "diff" | null;

export const useCompareStore = defineStore("compare", () => {
  const toast = useToast();

  const project = ref<string | null>(null);

  const availableProjects = ref<string[]>([]);
  const projectsInTab = ref<string[]>([]);
  const availableSets = ref<GetAvailableSetResponse>({
    ref: [],
    test: [],
  });

  const _compareResult = ref<null | CompareResponse$Data>(null);
  const isComparing = ref(false);
  const expandedKeys = ref(new Set<string>());
  const highlightKey = ref<null | string>(null);
  const selectedKey = ref<null | string>(null);
  const searchText = ref("");
  const typeOptions = ref<null | TypeOptions>(null);
  const selectedType = ref<"diff" | "added" | "removed" | "same">("diff");

  const explorerTreeData = computed(() => {
    return _compareResult.value === null
      ? []
      : getCompareResultTreeData(generateTreeFromRespData(_compareResult.value, selectedType.value));
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

  const currentDisplayingImgType = ref<CurrentDisplayingImgType>(null);

  const displayingSingleImg = ref<ImgState>({
    loading: false,
    isExist: null,
    base64: null,
  });

  const displaySameImg = ref<{ ref: ImgState; test: ImgState }>({
    ref: { loading: false, isExist: null, base64: null },
    test: { loading: false, isExist: null, base64: null },
  });

  const displayingDiffImg = ref<{ ref: ImgState; test: ImgState; diff: ImgState }>({
    ref: { loading: false, isExist: null, base64: null },
    test: { loading: false, isExist: null, base64: null },
    diff: { loading: false, isExist: null, base64: null },
  });

  const savingDialogOpen = ref(false);
  const isSaving = ref(false);

  const compare = async () => {
    isComparing.value = true;
    const relativeRefDir = `${project.value}/${refSet.value.branch}/${refSet.value.uuid}`;
    const relativeTestDir = `${project.value}/${testSet.value.branch}/${testSet.value.uuid}`;
    const response = await window.compareApi.compare(relativeRefDir, relativeTestDir);

    if (response.success) {
      _compareResult.value = response.data;
      expandedKeys.value.clear();
      highlightKey.value = null;
      selectedType.value = "diff";
      typeOptions.value = {
        same: response.data.result.same.length,
        diff: response.data.result.diff.length,
        added: response.data.result.added.length,
        removed: response.data.result.removed.length,
      };
      console.log("here");
    } else {
      // todo
    }

    isComparing.value = false;
  };

  const refreshData = async () => {
    availableProjects.value = await window.compareApi.getAvailableProjects();
    projectsInTab.value = await window.userSettingApi.getProjectsInTab();

    if (projectsInTab.value.length === 0) {
      project.value = null;
      availableSets.value = {
        ref: [],
        test: [],
      };
      refSet.value = {
        branch: null,
        uuid: null,
      };
      testSet.value = {
        branch: null,
        uuid: null,
      };
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
      const oldRefUuid = refSet.value.uuid;
      const oldTestUuid = testSet.value.uuid;

      await updateProject(project.value, false);

      const oldRefBranchData = availableSets.value.ref.find(x => x.branch === oldRefBranch);
      if (oldRefBranchData) {
        refSet.value.branch = oldRefBranch;
        if (oldRefUuid && oldRefBranchData.setList.find(x => x.uuid === oldRefUuid)) {
          refSet.value.uuid = oldRefUuid;
        }
      }

      const oldTestBranchData = availableSets.value.test.find(x => x.branch === oldTestBranch);
      if (oldTestBranchData) {
        testSet.value.branch = oldTestBranch;
        if (oldTestUuid && oldTestBranchData.setList.find(x => x.uuid === oldTestUuid)) {
          testSet.value.uuid = oldTestUuid;
        }
      }
    }
  };

  const updateProject = async (projectName: string, skipIfSame = true) => {
    if (skipIfSame && projectName === project.value) return;

    project.value = projectName;
    refSet.value = {
      branch: null,
      uuid: null,
    };
    testSet.value = {
      branch: null,
      uuid: null,
    };

    const result = await window.compareApi.getAvailableSets(projectName);
    availableSets.value = result;
  };

  const updateProjectsInTab = async (projects: string[]) => {
    const success = await window.userSettingApi.updateProjectsInTab(projects);
    if (success) {
      projectsInTab.value = projects;
    }
    projectsInTab.value = projects;
  };

  const refSet = ref<CompareSet>({
    branch: null,
    uuid: null,
  });

  const testSet = ref<CompareSet>({
    branch: null,
    uuid: null,
  });

  const updateRefSetBranch = (x: string) => {
    if (x === refSet.value.branch) return;
    refSet.value.branch = x;
    refSet.value.uuid = null;
  };

  const updateTestSetBranch = (x: string) => {
    if (x === testSet.value.branch) return;
    testSet.value.branch = x;
    testSet.value.uuid = null;
  };

  const updateRefSetUuid = (x: string) => {
    refSet.value.uuid = x;
  };

  const updateTestSetUuid = (x: string) => {
    testSet.value.uuid = x;
  };

  const openInExplorer = () => {
    window.compareApi.openInExplorer();
  };

  const getAddedImg = async (id: string) => {
    displayingSingleImg.value = { loading: true, isExist: null, base64: null };
    const result = await window.imgApi.getCompareAddedImg(id);
    displayingSingleImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  const getRemovedImg = async (id: string) => {
    console.log("id: ", id);
    displayingSingleImg.value = { loading: true, isExist: null, base64: null };
    const result = await window.imgApi.getCompareRemovedImg(id);
    console.log(result);
    displayingSingleImg.value = { loading: false, isExist: result.isExist, base64: result.base64 };
  };

  const getSameImg = async (id: string) => {
    const localResult = _compareResult.value;
    if (localResult === null) return;
    const { project, refBranch, refId, testBranch, testSetId } = localResult;
    console.log(testSetId);
    displaySameImg.value.ref = { loading: true, isExist: null, base64: null };
    displaySameImg.value.test = { loading: true, isExist: null, base64: null };
    const [refImg, testImg] = await Promise.all([
      window.imgApi.getSavedImg("reference", project, refBranch, refId, id),
      window.imgApi.getSavedImg("test", project, testBranch, testSetId, id),
    ]);
    displaySameImg.value.ref = { loading: false, isExist: refImg.isExist, base64: refImg.base64 };
    displaySameImg.value.test = {
      loading: false,
      isExist: testImg.isExist,
      base64: testImg.base64,
    };
  };

  const getDiffImg = async (id: string) => {
    const localResult = _compareResult.value;
    if (localResult === null) return;
    const { project, refBranch, refId, testBranch, testSetId } = localResult;
    displayingDiffImg.value.ref = { loading: true, isExist: null, base64: null };
    displayingDiffImg.value.test = { loading: true, isExist: null, base64: null };
    displayingDiffImg.value.diff = { loading: true, isExist: null, base64: null };
    const [refImg, testImg, diffImg] = await Promise.all([
      window.imgApi.getSavedImg("reference", project, refBranch, refId, id),
      window.imgApi.getSavedImg("test", project, testBranch, testSetId, id),
      window.imgApi.getCompareDiffImg(id),
    ]);
    displayingDiffImg.value.ref = {
      loading: false,
      isExist: refImg.isExist,
      base64: refImg.base64,
    };
    displayingDiffImg.value.test = {
      loading: false,
      isExist: testImg.isExist,
      base64: testImg.base64,
    };
    displayingDiffImg.value.diff = {
      loading: false,
      isExist: diffImg.isExist,
      base64: diffImg.base64,
    };
  };

  const setCurrentDisplayingImgType = (type: CurrentDisplayingImgType) => {
    currentDisplayingImgType.value = type;
  };

  const saveScreenshot = async () => {
    isSaving.value = true;
    const result = await window.compareApi.saveComparisonResult();
    isSaving.value = false;

    if (result.success) {
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "Successfully saved the comparison result",
        life: 5000,
      });
      savingDialogOpen.value = false;
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "Fail to saved the comparison result",
        life: 5000,
      });
      console.log(result.errMsg);
    }
  };

  const openSaveDialog = () => {
    savingDialogOpen.value = true;
  };

  return {
    isComparing,
    project,
    availableProjects,
    availableSets,
    refSet,
    testSet,
    currentDisplayingImgType,
    explorerTreeData,
    highlightKey,
    expandedKeys,
    selectedKey,
    displayingDiffImg,
    displaySameImg,
    displayingSingleImg,
    isSaving,
    savingDialogOpen,
    searchText,
    typeOptions,
    projectsInTab,
    selectedType,
    updateProject,
    compare,
    refreshData,
    updateRefSetBranch,
    updateTestSetBranch,
    updateRefSetUuid,
    updateTestSetUuid,
    openInExplorer,
    getAddedImg,
    getRemovedImg,
    getSameImg,
    getDiffImg,
    setCurrentDisplayingImgType,
    saveScreenshot,
    openSaveDialog,
    expandAll,
    collapseAll,
    updateProjectsInTab,
  };
});
