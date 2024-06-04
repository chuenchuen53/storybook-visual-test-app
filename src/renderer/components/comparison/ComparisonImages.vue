<template>
  <div v-if="comparisonImageState.type">
    <div v-if="comparisonImageState.type === 'added'">
      <div class="mb-2 text-lg">Added</div>
      <StyledImg :img="comparisonImageState.testImg" alt="screenshot" class="flex justify-center" />
    </div>
    <div v-if="comparisonImageState.type === 'removed'">
      <div class="mb-2 text-lg">Removed</div>
      <StyledImg :img="comparisonImageState.refImg" alt="screenshot" class="flex justify-center" />
    </div>
    <div v-if="comparisonImageState.type === 'same'">
      <div class="mb-2 text-lg">Same</div>
      <div class="mb-4 flex justify-end gap-[2px]">
        <Button
          class="!size-8 !p-0"
          text
          :severity="diffViewInVertical ? undefined : 'secondary'"
          @click="$emit('changeDiffViewInVertical', true)"
        >
          <SplitIcon :size="24" />
        </Button>
        <Button
          text
          class="!size-8 rotate-90 !p-0"
          :severity="!diffViewInVertical ? undefined : 'secondary'"
          @click="$emit('changeDiffViewInVertical', false)"
        >
          <SplitIcon :size="24" />
        </Button>
      </div>
      <div
        class="grid gap-4"
        :class="diffViewInVertical ? 'grid-cols-1 grid-rows-2 justify-items-center' : 'grid-cols-2 grid-rows-1'"
      >
        <StyledImg
          :img="comparisonImageState.refImg"
          alt="screenshot"
          :class="!diffViewInVertical && 'justify-self-end'"
        />
        <StyledImg :img="comparisonImageState.testImg" alt="screenshot" />
      </div>
    </div>
    <div v-if="comparisonImageState.type === 'diff'">
      <div class="mb-2 text-lg">Different</div>
      <div class="mb-4 flex justify-end gap-[2px]">
        <Button
          text
          class="!h-8 !py-0"
          :severity="!showDiffImg ? undefined : 'secondary'"
          @click="$emit('changeShowDiffImg', false)"
          >Original
        </Button>
        <Button
          text
          class="!h-8 !py-0"
          :severity="showDiffImg ? undefined : 'secondary'"
          @click="$emit('changeShowDiffImg', true)"
          >Diff
        </Button>
        <Button
          class="!size-8 !p-0"
          text
          :severity="diffViewInVertical ? undefined : 'secondary'"
          @click="$emit('changeDiffViewInVertical', true)"
        >
          <SplitIcon :size="24" />
        </Button>
        <Button
          text
          class="!size-8 rotate-90 !p-0"
          :severity="!diffViewInVertical ? undefined : 'secondary'"
          @click="$emit('changeDiffViewInVertical', false)"
        >
          <SplitIcon :size="24" />
        </Button>
      </div>
      <div
        class="grid gap-4"
        :class="diffViewInVertical ? 'grid-cols-1 grid-rows-2 justify-items-center' : 'grid-cols-2 grid-rows-1'"
      >
        <StyledImg
          :img="comparisonImageState.refImg"
          alt="screenshot"
          :class="!diffViewInVertical && 'justify-self-end'"
        />
        <StyledImg v-if="showDiffImg" :img="comparisonImageState.diffImg" alt="screenshot" />
        <StyledImg v-else :img="comparisonImageState.testImg" alt="screenshot" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import SplitIcon from "../shared/SplitIcon.vue";
import StyledImg from "../general/image/StyledImg.vue";
import type { UnwrapRef } from "vue";
import type { ComparisonImageState } from "../../composables/useComparisonImage";

defineProps<{
  showDiffImg: boolean;
  diffViewInVertical: boolean;
  comparisonImageState: UnwrapRef<ComparisonImageState>;
}>();

defineEmits<{
  changeShowDiffImg: [value: boolean];
  changeDiffViewInVertical: [value: boolean];
}>();
</script>
