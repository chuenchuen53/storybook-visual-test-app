<template>
  <section v-if="diff.length > 0">
    <div class="mb-4 text-lg font-semibold">Difference</div>
    <div v-for="(x, index) in diff" :key="index" class="mb-12">
      <button class="mb-4 cursor-pointer hover:underline" @click="$emit('clickTitle', 'diff', x.id)">
        {{ x.title }}
      </button>
      <div class="grid grid-cols-2 grid-rows-2 gap-4">
        <StyledImg :img="x.refImg" alt="screenshot" class="justify-self-end" />
        <StyledImg :img="x.testImg" alt="screenshot" />
        <StyledImg class="col-start-2" :img="x.diffImg" alt="screenshot" />
      </div>
    </div>
  </section>
  <section v-if="added.length > 0">
    <div class="mb-4 text-lg font-semibold">Added</div>
    <div v-for="(x, index) in added" :key="index" class="mb-12">
      <button class="mb-4 cursor-pointer hover:underline" @click="$emit('clickTitle', 'added', x.id)">
        {{ x.title }}
      </button>
      <StyledImg :img="x.img" alt="screenshot" class="flex justify-center" />
    </div>
  </section>
  <section v-if="removed.length > 0">
    <div class="mb-4 text-lg font-semibold">Removed</div>
    <div v-for="(x, index) in removed" :key="index" class="mb-12">
      <button class="mb-4 cursor-pointer hover:underline" @click="$emit('clickTitle', 'removed', x.id)">
        {{ x.title }}
      </button>
      <StyledImg :img="x.img" alt="screenshot" class="flex justify-center" />
    </div>
  </section>
</template>

<script setup lang="ts">
import StyledImg from "../../general/image/StyledImg.vue";
import type { ComparisonSummaryImgsProps } from "./type";
import type { StoriesDiffResult } from "../../../../shared/type";

defineProps<ComparisonSummaryImgsProps>();

defineEmits<{
  clickTitle: [type: keyof StoriesDiffResult, id: string];
}>();
</script>
