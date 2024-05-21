<template>
  <div class="flex items-center justify-center gap-x-4">
    <label for="storybook-url-input" class="font-bold">Storybook url:</label>
    <InputText
      id="storybook-url-input"
      v-model="storybookUrl"
      class="w-[350px]"
      :disabled="processing"
      type="text"
      placeholder="input local ip, not localhost"
    />
    <Button :disabled="processing || storybookUrl === ''" @click="startScreenshot">screenshot</Button>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useScreenshotStore } from "../../stores/ScreenshotStore";

const store = useScreenshotStore();
const { storybookUrl, processing } = storeToRefs(store);
const { getDefaultStorybookUrl, startScreenshot } = store;

onMounted(() => {
  if (storybookUrl.value === "") {
    getDefaultStorybookUrl();
  }
});
</script>
