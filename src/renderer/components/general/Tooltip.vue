<template>
  <div>
    <div ref="triggerRef" class="cursor-help" @mouseenter="showPopover" @mouseleave="hidePopover">
      <slot name="trigger"></slot>
    </div>

    <Popover ref="popoverRef">
      <slot name="popover"></slot>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Popover from "primevue/popover";

const triggerRef = ref<HTMLElement | null>(null);
const popoverRef = ref<InstanceType<typeof Popover> | null>(null);

const showPopover = (e: Event) => {
  popoverRef.value?.show(e, triggerRef.value);
};

const hidePopover = () => {
  popoverRef.value?.hide();
};
</script>
