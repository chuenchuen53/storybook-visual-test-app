<template>
  <div>
    <div v-if="delayedLoading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div v-if="img.src">
        <LightboxImage :src="img.src" :alt="alt" />
      </div>
      <div v-else-if="img.isExist !== null && img.isExist === false" class="text-center text-gray-400">
        Image not exist
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import { computed } from "vue";
import { useDelayLoading } from "../../../composables/useDelayLoading";
import LightboxImage from "./LightboxImage.vue";
import type { ImageState } from "../../../composables/useImage";

const props = defineProps<{
  img: ImageState;
  alt?: string;
}>();

const loading = computed(() => props.img.loading);
const delayedLoading = useDelayLoading(loading);
</script>
