<template>
  <div>
    <div v-if="delayedLoading">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div v-if="img.base64">
        <Image :src="'data:image/png;base64,' + img.base64" alt="screenshot" />
      </div>
      <div v-else-if="!img.isExist" class="text-center text-gray-400">Image not exist</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import { computed } from "vue";
import { useDelayLoading } from "../composables/useDelayLoading";
import Image from "./Image.vue";

const props = defineProps<{
  img: {
    base64: string;
    isExist: boolean;
    loading: boolean;
  };
  alt?: string;
}>();

const loading = computed(() => props.img.loading);
const delayedLoading = useDelayLoading(loading);
</script>
