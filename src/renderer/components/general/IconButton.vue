<template>
  <Button
    :style="{
      '--wrapper-size': `${wrapperSize}px`,
      '--p-icon-size': `${iconSize}px`,
    }"
    class="icon-btn"
    :icon="icon"
    :severity="severity"
    text
    rounded
    @click="$emit('click', $event)"
  />
</template>

<script setup lang="ts">
import Button from "primevue/button";

interface Props {
  icon: string;
  severity?: "primary" | "secondary" | "success" | "info" | "warn" | "help" | "danger" | "contrast";
  wrapperSize?: number;
  iconSize?: number;
}

withDefaults(defineProps<Props>(), {
  severity: "secondary",
  wrapperSize: 32,
  iconSize: 12,
});

defineEmits(["click"]);
</script>

<style scoped lang="scss">
.icon-btn {
  --wrapper-size: var(--wrapper-size);

  padding: 0 !important;
  width: var(--wrapper-size) !important;
  height: var(--wrapper-size) !important;
}
</style>
