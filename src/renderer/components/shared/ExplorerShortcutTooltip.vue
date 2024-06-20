<template>
  <div class="inline-flex">
    <Tooltip>
      <template #trigger>
        <IconButton icon="pi pi-info-circle" />
      </template>
      <template #popover>
        <div class="flex justify-between gap-8">
          <div>Previous story</div>
          <code>{{ modifier }} ←</code>
        </div>
        <div class="flex justify-between gap-8">
          <div>Next story</div>
          <code>{{ modifier }} →</code>
        </div>
      </template>
      <slot />
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
import Tooltip from "../general/Tooltip.vue";
import IconButton from "../general/IconButton.vue";

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const modifier = isMac ? "⌥" : "alt";
</script>
