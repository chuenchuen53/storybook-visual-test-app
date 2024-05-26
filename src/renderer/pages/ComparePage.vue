<template>
  <main class="size-full">
    <LeftRightSplitContainer :init-left-width="325">
      <template #left>
        <CompareResultExplorer />
      </template>
      <template #right>
        <div class="size-full">
          <ProjectTabs
            :all-projects="availableProjects"
            :all-projects-in-tab="projectsInTab"
            :selected="project"
            @click-project="updateProject"
            @click-add="displayTabsSetting = true"
          />
          <div v-if="displayTabsSetting">
            <ProjectPickerList
              :all-projects="availableProjects"
              :all-projects-in-tab="projectsInTab"
              @confirm="handlePickerConfirm"
              @cancel="displayTabsSetting = false"
            />
          </div>
          <div v-else>
            <div class="w-full p-6">
              <CompareSetting />
            </div>
            <div v-if="currentDisplayingImgType !== null">{{ currentDisplayingImgType }}</div>
            <div v-if="singleImgSrc" class="mt-4 flex w-full justify-center">
              <div v-if="singleImgSrc.loading">
                <ProgressSpinner />
              </div>
              <div v-else>
                <div v-if="singleImgSrc.isExist && singleImgSrc.base64">
                  <Image :src="'data:image/png;base64,' + singleImgSrc.base64" alt="screenshot" preview />
                </div>
                <div v-else class="text-center text-gray-400">Image not exist</div>
              </div>
            </div>
            <div v-if="currentDisplayingImgType === 'same'">
              <div class="grid grid-cols-2 gap-x-2">
                <div v-for="(img, index) in [displaySameImg.ref, displaySameImg.test]" :key="index">
                  <div v-if="img.loading">
                    <ProgressSpinner />
                  </div>
                  <div v-else>
                    <div v-if="img.isExist && img.base64">
                      <Image :src="'data:image/png;base64,' + img.base64" alt="screenshot" preview />
                    </div>
                    <div v-else class="text-center text-gray-400">Image not exist</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="currentDisplayingImgType === 'diff'">
              <Button @click="toggleDiffViewMode">toggle</Button>
              <div class="grid grid-cols-2 gap-x-2">
                <div
                  v-for="(img, index) in diffDisplayMode === 'ref-test'
                    ? [displayingDiffImg.ref, displayingDiffImg.test]
                    : [displayingDiffImg.ref, displayingDiffImg.diff]"
                  :key="index"
                >
                  <div v-if="img.loading">
                    <ProgressSpinner />
                  </div>
                  <div v-else>
                    <div v-if="img.isExist && img.base64">
                      <Image :src="'data:image/png;base64,' + img.base64" alt="screenshot" preview />
                    </div>
                    <div v-else class="text-center text-gray-400">Image not exist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </LeftRightSplitContainer>
  </main>

  <SaveCompareResultDialog />
</template>

<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import Button from "primevue/button";
import ProjectTabs from "../components/shared/ProjectTabs.vue";
import ProjectPickerList from "../components/shared/ProjectPickerList.vue";
import CompareResultExplorer from "../components/compare/comparison-result-explorer/ComparisonResultExplorer.vue";
import CompareSetting from "../components/compare/CompareSetting.vue";
import { useCompareStore } from "../stores/CompareStore";
import SaveCompareResultDialog from "../components/compare/SaveCompareResultDialog.vue";
import LeftRightSplitContainer from "../components/LeftRightSplitContainer.vue";

const store = useCompareStore();
const {
  currentDisplayingImgType,
  displayingSingleImg,
  displaySameImg,
  displayingDiffImg,
  project,
  availableProjects,
  projectsInTab,
} = storeToRefs(store);
const { updateProject, updateProjectsInTab } = store;

const diffDisplayMode = ref<"ref-test" | "ref-diff">("ref-test");

const toggleDiffViewMode = () => {
  diffDisplayMode.value = diffDisplayMode.value === "ref-test" ? "ref-diff" : "ref-test";
};

const singleImgSrc = computed(() => {
  if (currentDisplayingImgType.value === "added" || currentDisplayingImgType.value === "removed") {
    return displayingSingleImg.value;
  }
  return null;
});

const displayTabsSetting = ref(false);

const handlePickerConfirm = (projects: string[]) => {
  updateProjectsInTab(projects);
  displayTabsSetting.value = false;
};
</script>
