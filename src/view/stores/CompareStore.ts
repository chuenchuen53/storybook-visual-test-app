import { defineStore } from "pinia";
import { ref } from "vue";
import type { CompareResponse, GetAvailableSetResponse } from "../../interface";

interface CompareSet {
  branch: string | null;
  uuid: string | null;
}

interface ImgState {
  loading: boolean;
  isExist: boolean | null;
  base64: string | null;
}

type CurrentDisplayingImgType = "same" | "added" | "removed" | "diff" | null;

export const useCompareStore = defineStore("compare", () => {
  const project = ref<string | null>(null);

  const availableProjects = ref<string[]>([]);
  const availableSets = ref<GetAvailableSetResponse>({
    ref: [],
    test: [],
  });

  const compareResult = ref<null | CompareResponse>(null);
  const isComparing = ref(false);

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

  const compare = async () => {
    isComparing.value = true;
    const relativeRefDir = `${project.value}/${refSet.value.branch}/${refSet.value.uuid}`;
    const relativeTestDir = `${project.value}/${testSet.value.branch}/${testSet.value.uuid}`;
    compareResult.value = await window.compareApi.compare(relativeRefDir, relativeTestDir);

    isComparing.value = false;

    console.log(compareResult.value);
  };

  const refreshData = async () => {
    availableProjects.value = await window.compareApi.getAvailableProjects();

    if (availableProjects.value.length === 0) {
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
      await updateProject(availableProjects.value[0]);
    } else if (project.value && availableProjects.value.includes(project.value)) {
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
    const localResult = compareResult.value;
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
    displaySameImg.value.test = { loading: false, isExist: testImg.isExist, base64: testImg.base64 };
  };

  const getDiffImg = async (id: string) => {
    const localResult = compareResult.value;
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
    displayingDiffImg.value.ref = { loading: false, isExist: refImg.isExist, base64: refImg.base64 };
    displayingDiffImg.value.test = { loading: false, isExist: testImg.isExist, base64: testImg.base64 };
    displayingDiffImg.value.diff = { loading: false, isExist: diffImg.isExist, base64: diffImg.base64 };
  };

  const setCurrentDisplayingImgType = (type: CurrentDisplayingImgType) => {
    currentDisplayingImgType.value = type;
  };

  return {
    isComparing,
    project,
    availableProjects,
    availableSets,
    refSet,
    testSet,
    currentDisplayingImgType,
    compareResult,
    displayingDiffImg,
    displaySameImg,
    displayingSingleImg,
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
  };
});
