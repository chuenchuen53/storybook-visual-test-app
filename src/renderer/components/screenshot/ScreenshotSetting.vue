<template>
  <div class="mx-auto flex w-fit flex-col gap-4">
    <div class="grid grid-cols-[120px_350px] gap-4">
      <label for="storybook-url-input" class="self-center justify-self-end font-bold">Storybook url:</label>
      <InputText
        id="storybook-url-input"
        v-model="storybookUrl"
        :disabled="isProcessing"
        type="text"
        placeholder="input local ip, not localhost"
      />
      <label for="storybook-viewport-input" class="self-center justify-self-end font-bold">Viewport:</label>
      <AutoComplete
        id="storybook-viewport-input"
        v-model="viewportInput"
        dropdown
        placeholder="input viewport in [width]x[height]"
        :invalid="viewportInvalid"
        :disabled="isProcessing"
        :suggestions="items"
        :empty-search-message="viewportInput"
        @complete="search"
        @blur="updateViewport"
      />
      <label for="storybook-concurrency-input" class="self-center justify-self-end font-bold">Concurrency:</label>
      <InputNumber
        id="storybook-concurrency-input"
        v-model="nullableConcurrency"
        :disabled="isProcessing"
        type="number"
        :min="1"
        :use-grouping="false"
        placeholder="input concurrency"
      />
    </div>
    <div class="flex justify-end">
      <Button :disabled="disableSubmit" @click="startScreenshot">screenshot</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import InputNumber from "primevue/InputNumber";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useScreenshotStore } from "../../stores/ScreenshotStore";

const store = useScreenshotStore();
const { storybookUrl, isProcessing, viewport, concurrency } = storeToRefs(store);
const { getDefaultStorybookUrl, startScreenshot } = store;

const viewportInput = ref(viewport.value.width + "x" + viewport.value.height);
const viewportInvalid = ref(false);
const suggestion = ref(["375x667", "1920x1080"]);
const items = ref<string[]>([]);
const nullableConcurrency = ref<number | null>(concurrency.value);

const search = (event: AutoCompleteCompleteEvent) => {
  items.value = suggestion.value.filter(v => v.includes(event.query));
};

const updateViewport = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  const pattern = /^\d+x\d+$/;
  if (!pattern.test(value)) {
    viewportInvalid.value = true;
    return;
  }
  const [width, height] = value.split("x").map(v => parseInt(v));
  if (width <= 0 || height <= 0) {
    viewportInvalid.value = true;
    return;
  }
  viewportInvalid.value = false;
  viewport.value = { width, height };
};

watchEffect(() => {
  if (nullableConcurrency.value !== null) {
    concurrency.value = nullableConcurrency.value;
  }
});

const disableSubmit = computed(() => {
  return isProcessing.value || storybookUrl.value === "" || viewportInvalid.value || nullableConcurrency.value === null;
});

onMounted(() => {
  if (storybookUrl.value === "") {
    getDefaultStorybookUrl();
  }
});
</script>
