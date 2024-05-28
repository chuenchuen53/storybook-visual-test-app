<template>
  <img :src="src" :alt="alt" class="cursor-zoom-in" @click="open(src)" />
</template>

<script setup lang="ts">
import { useLightboxStore } from "../stores/LightboxStore";

const store = useLightboxStore();
const { open } = store;

defineProps<{
  src: string;
  alt?: string;
}>();
</script>
