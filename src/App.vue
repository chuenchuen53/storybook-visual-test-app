<template>
  <h1 class="text-3xl font-bold underline">💖 Hello World!</h1>
  <p>Welcome to your Electron application.</p>
  <Checkbox input-id="my-checkbox" v-model="checked" :binary="true" />
  <label class="ml-2" for="my-checkbox">{{ checked ? "checked" : "unchecked" }}</label>
  <br />
  <DarkThemeSwitch />
</template>

<script setup>
import { ref } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import DarkThemeSwitch from "./components/DarkThemeSwitch.vue";

const checked = ref(false);

console.log('👋 This message is being logged by "App.vue", included via Vite');
</script>
