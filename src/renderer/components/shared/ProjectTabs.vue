<template>
  <div class="flex w-full justify-between overflow-hidden">
    <div class="scrollbar-hidden flex basis-[calc(100%-35px)] flex-nowrap overflow-x-auto">
      <Button
        v-for="x in allProjectsInTab"
        :key="x"
        :text="x !== selected"
        :severity="x === selected ? 'primary' : 'secondary'"
        size="small"
        class="flex-shrink-0 whitespace-nowrap !rounded-none"
        @click="$emit('clickProject', x)"
      >
        {{ x }}
      </Button>
    </div>
    <div class="flex-shrink-0 flex-grow-0 basis-[35px]">
      <Button severity="secondary" size="small" text class="!w-[35px] !rounded-none" @click="$emit('clickAdd')"
        >+</Button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";

defineProps<{
  allProjects: string[];
  allProjectsInTab: string[];
  selected: string | null;
}>();

defineEmits<{
  clickProject: [project: string];
  clickAdd: [];
}>();
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
</style>
