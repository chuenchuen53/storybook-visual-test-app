<template>
  <VueEasyLightbox :visible="visible" :imgs="img" :zoom-scale="0.1" @hide="close" />
</template>
<script setup lang="ts">
import VueEasyLightbox from "vue-easy-lightbox";
import { storeToRefs } from "pinia";
import { useLightboxStore } from "../stores/LightboxStore";

const store = useLightboxStore();
const { visible, img } = storeToRefs(store);
const { close } = store;
</script>
