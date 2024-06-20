<template>
  <div>
    <form @submit.prevent="startScreenshot">
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
          v-model="viewportInput"
          input-id="storybook-viewport-input"
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
          v-model="nullableConcurrency"
          input-id="storybook-concurrency-input"
          :disabled="isProcessing"
          type="number"
          :min="1"
          :use-grouping="false"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <Button :disabled="disableSubmit" type="submit">screenshot</Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";
import InputNumber from "primevue/InputNumber";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useScreenshotStore } from "../../stores/ScreenshotStore";
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";

const store = useScreenshotStore();
const { storybookUrl, isProcessing, viewport, concurrency } = storeToRefs(store);
const { getDefaultStorybookUrl, startScreenshot } = store;

const viewportInput = ref(viewport.value.width + "x" + viewport.value.height);
const viewportInvalid = ref(false);
const suggestion = ref(["375x667", "414x896", "1920x1080"]);
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
