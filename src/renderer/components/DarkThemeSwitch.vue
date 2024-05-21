<template>
  <Button class="h-10" :icon="isDark ? 'pi pi-moon' : 'pi pi-sun'" @click="toggleColorScheme()"></Button>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { ref } from "vue";

const isDark = ref(document.documentElement.classList.contains("dark"));

function toggleColorScheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark");
}
</script>
