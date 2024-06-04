<template>
  <IconButton class="h-10" :icon="appTheme === 'dark' ? 'pi pi-moon' : 'pi pi-sun'" @click="toggleTheme" />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "../../stores/GlobalStore";
import IconButton from "./IconButton.vue";

const store = useGlobalStore();
const { appTheme } = storeToRefs(store);
const { getThemeFromSetting, toggleTheme } = store;

onMounted(() => {
  void getThemeFromSetting();
});
</script>
