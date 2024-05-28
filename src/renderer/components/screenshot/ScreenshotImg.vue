<template>
  <div v-if="selectedStory" class="mt-4 flex w-full justify-center">
    <div v-if="selectedStory.state === StoryState.WAITING">Waiting for capture ...</div>
    <div v-else-if="selectedStory.state === StoryState.CAPTURING">Capturing ...</div>
    <div v-else>
      <div v-if="delayedLoading">
        <ProgressSpinner />
      </div>
      <div v-else>
        <div v-if="displayingImg.base64">
          <Image :src="'data:image/png;base64,' + displayingImg.base64" alt="screenshot" />
        </div>
        <div v-else-if="displayingImg.isExist === false" class="text-center text-gray-400">Image not exist</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import Image from "../Image.vue";
import { useScreenshotStore } from "../../stores/ScreenshotStore";
import { StoryState } from "../../../shared/type";
import { useDelayLoading } from "../../composables/useDelayLoading";

const store = useScreenshotStore();
const { selectedStory, displayingImg } = storeToRefs(store);

const loading = computed(() => displayingImg.value.loading);
const delayedLoading = useDelayLoading(loading);
</script>
