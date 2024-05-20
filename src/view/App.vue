<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toast />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Toast from "primevue/toast";
import AppLayout from "./AppLayout.vue";
</script>
