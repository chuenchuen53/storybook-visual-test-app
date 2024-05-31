<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <Toast />
  <ConfirmPopup />
  <Lightbox />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Toast from "primevue/toast";
import ConfirmPopup from "primevue/confirmpopup";
import AppLayout from "./AppLayout.vue";
import Lightbox from "./components/general/image/Lightbox.vue";
import { useGlobalStore } from "./stores/GlobalStore";

useGlobalStore();
</script>
