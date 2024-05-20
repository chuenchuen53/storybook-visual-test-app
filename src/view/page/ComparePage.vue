<template>
  <div class="flex-grow">
    <div class="fixed bottom-0 left-0 top-[50px] z-10 w-[400px]">
      <CompareResultExplorer />
    </div>

    <div class="justify-content-center ml-[400px]">
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

  <SaveCompareResultDialog />
</template>

<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import Steps from "primevue/steps";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import Button from "primevue/button";
import CompareResultExplorer from "../components/compare/CompareResultExplorer.vue";
import CompareSetting from "../components/compare/CompareSetting.vue";
import { useCompareStore } from "../stores/CompareStore";
import SaveCompareResultDialog from "../components/compare/SaveCompareResultDialog.vue";

const store = useCompareStore();
const { currentDisplayingImgType, displayingSingleImg, displaySameImg, displayingDiffImg } = storeToRefs(store);

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
</script>
