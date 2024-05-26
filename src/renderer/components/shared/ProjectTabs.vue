<template>
  <div class="flex justify-between">
    <div>
      <Button
        v-for="x in allProjectsInTab"
        :key="x"
        :text="x !== selected"
        :severity="x === selected ? 'primary' : 'secondary'"
        size="small"
        class="!rounded-none"
        @click="$emit('clickProject', x)"
      >
        {{ x }}
      </Button>
    </div>
    <div>
      <Button severity="secondary" size="small" text class="!rounded-none" @click="$emit('clickAdd')">+</Button>
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
