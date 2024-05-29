<template>
  <div>{{ JSON.stringify(displayingImg) }}</div>
  <div v-if="displayingImg">
    <div v-if="displayingImg.type === 'added'">
      <div class="text-lg">Added</div>
      <StyledImg :img="displayingImg.test" alt="screenshot" />
    </div>
    <div v-if="displayingImg.type === 'removed'">
      <div class="text-lg">Removed</div>
      <StyledImg :img="displayingImg.ref" alt="screenshot" />
    </div>
    <div v-if="displayingImg.type === 'same'">
      <div class="text-lg">Same</div>
      <div class="mb-4 flex justify-end gap-[2px]">
        <Button
          class="!size-8 !p-0"
          text
          :severity="diffViewInVertical ? undefined : 'secondary'"
          @click="diffViewInVertical = true"
        >
          <SplitIcon :size="24" />
        </Button>
        <Button
          text
          class="!size-8 rotate-90 !p-0"
          :severity="!diffViewInVertical ? undefined : 'secondary'"
          @click="diffViewInVertical = false"
        >
          <SplitIcon :size="24" />
        </Button>
      </div>
      <div class="grid gap-2" :class="diffViewInVertical ? 'grid-cols-1 grid-rows-2' : 'grid-cols-2 grid-rows-1'">
        <StyledImg :img="displayingImg.ref" alt="screenshot" />
        <StyledImg :img="displayingImg.test" alt="screenshot" />
      </div>
    </div>
    <div v-if="displayingImg.type === 'diff'">
      <div class="text-lg">Diff</div>
      <div class="mb-4 flex justify-end gap-[2px]">
        <Button text class="!h-8 !py-0" :severity="!showDiffImg ? undefined : 'secondary'" @click="showDiffImg = false"
          >Original
        </Button>
        <Button text class="!h-8 !py-0" :severity="showDiffImg ? undefined : 'secondary'" @click="showDiffImg = true"
          >Diff
        </Button>
        <Button
          class="!size-8 !p-0"
          text
          :severity="diffViewInVertical ? undefined : 'secondary'"
          @click="diffViewInVertical = true"
        >
          <SplitIcon :size="24" />
        </Button>
        <Button
          text
          class="!size-8 rotate-90 !p-0"
          :severity="!diffViewInVertical ? undefined : 'secondary'"
          @click="diffViewInVertical = false"
        >
          <SplitIcon :size="24" />
        </Button>
      </div>
      <div class="grid gap-2" :class="diffViewInVertical ? 'grid-cols-1 grid-rows-2' : 'grid-cols-2 grid-rows-1'">
        <StyledImg :img="displayingImg.ref" alt="screenshot" />
        <StyledImg v-if="showDiffImg" :img="displayingImg.diff" alt="screenshot" />
        <StyledImg v-else :img="displayingImg.test" alt="screenshot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import Button from "primevue/button";
import SplitIcon from "../shared/SplitIcon.vue";
import { useComparisonStore } from "../../stores/ComparisonStore";
import StyledImg from "../StyledImg.vue";

const store = useComparisonStore();
const { showDiffImg, diffViewInVertical, displayingImg } = storeToRefs(store);
</script>
