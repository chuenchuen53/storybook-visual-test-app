import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { useStoryExplorer } from "../composables/useStoryExplorer";
import { useImage } from "../composables/useImage";
import { useComparisonResultExplorer } from "../composables/useComparisonResultExplorer";
import { useComparisonImage } from "../composables/useComparisonImage";
import type { ComparisonResultTreeLeaf } from "../components/comparison/comparison-result-explorer/helper";
import type { ComparisonSavedInfo, RefTestSavedInfo, SavedSets, StoryScreenshotMetadata } from "../../shared/type";

type CurrentSelectedSet = RefTestSavedInfo | ComparisonSavedInfo | null;

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

  const selectedKey = ref<string | null>(null);

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
    replaceBackingData: comparisonReplaceBackingData,
    comparisonSetSummary: comparisonGetSetMetadata,
    expandAll: comparisonExpandAll,
    collapseAll: comparisonCollapseAll,
  } = useComparisonResultExplorer();
  const { comparisonImageState, resetImgs, setSameImg, setAddedImg, setRemovedImg, setDiffImg } = useComparisonImage();

  const updateProject = async (x: string) => {
    project.value = x;
    currentSelectedSet.value = null;
    savedSets.value = null;
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
    const metadataList = await window.savedSetApi.invoke.getRefOrTestSavedSetMetadata({
      type,
      project,
      branch,
      setId: id,
    });
    refTestReplaceBackingData(metadataList);
  };

  const openComparisonSet = async (set: ComparisonSavedInfo) => {
    currentSelectedSet.value = set;
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
    if (
      currentSelectedSet.value === null ||
      currentSelectedSetType.value === null ||
      "testBranch" in currentSelectedSet.value ||
      currentSelectedSetType.value === "compare"
    )
      return;
    const { project, branch, type, id: setId } = currentSelectedSet.value;
    await refTestUpdateImg(() =>
      window.imgApi.invoke.getSavedImg({
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

  const updateComparisonDisplayImg = (data: ComparisonResultTreeLeaf) => {
    window.alert("todo: select" + data.id);
  };

  return {
    project,
    availableProjects,
    projectsInTab,
    savedSets,
    currentSelectedSet,
    currentSelectedSetType,
    selectedKey,
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
  };
});
