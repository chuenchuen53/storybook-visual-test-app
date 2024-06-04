<template>
  <div class="relative size-full">
    <Splitter
      class="size-full !rounded-none !border-none"
      :gutter-size="gutterSize"
      :pt="{ root: { style: { background: 'transparent' } } }"
      @resizeend="onResizeEnd"
    >
      <SplitterPanel v-show="showLeft" ref="leftRef" :size="leftInitWidthRatio" :min-size="1" class="left-panel">
        <slot name="left" />
      </SplitterPanel>
      <SplitterPanel ref="rightRef" :size="rightInitWidthRatio" class="right-panel">
        <slot name="right" />
      </SplitterPanel>
    </Splitter>
    <div v-if="!showLeft" class="absolute left-6 top-11 z-10">
      <IconButton :wrapper-size="40" :icon-size="16" icon="pi pi-list" @click="showLeftPanel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import IconButton from "./general/IconButton.vue";

// the main usage of this component is to split the screen into two parts
// the following are the main features of this component:
// 1. the left panel will retain its width when the window is resized
// 2. the left panel will be hidden when its width is less than a certain threshold

const props = defineProps<{
  initLeftWidth: number;
}>();

const gutterSize = 3;
const showLeftThreshold = 200;

const [leftInitWidthRatio, rightInitWidthRatio] = getLeftRightRatio(props.initLeftWidth);

const showLeft = ref(true);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const leftRef = ref<any>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rightRef = ref<any>(null);
const leftDivSnapshotWidth = ref<number | null>(null);

onMounted(() => {
  leftDivSnapshotWidth.value = leftRef.value.$el.clientWidth;
  window.addEventListener("resize", handleWindowResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);
});

function handleWindowResize() {
  if (leftDivSnapshotWidth.value === null) return;
  const [leftWidthRatio, rightWidthRatio] = getLeftRightRatio(leftDivSnapshotWidth.value);
  leftRef.value.$el.style.flexBasis = `calc(${leftWidthRatio}% - 2px)`;
  rightRef.value.$el.style.flexBasis = `calc(${rightWidthRatio}% - 2px)`;
}

function getLeftRightRatio(expectedLeftWidth: number): [number, number] {
  const localWindowWidth = window.innerWidth;
  const rightWidth = localWindowWidth - expectedLeftWidth - gutterSize;
  const leftWidthRatio = ((expectedLeftWidth + gutterSize) / localWindowWidth) * 100;
  const rightWidthRatio = ((rightWidth + gutterSize) / localWindowWidth) * 100;
  return [leftWidthRatio, rightWidthRatio];
}

async function showLeftPanel() {
  showLeft.value = true;
  const [leftWidthRatio, rightWidthRatio] = getLeftRightRatio(props.initLeftWidth);
  leftRef.value.$el.style.flexBasis = `calc(${leftWidthRatio}% - 2px)`;
  rightRef.value.$el.style.flexBasis = `calc(${rightWidthRatio}% - 2px)`;
  await nextTick();
  leftDivSnapshotWidth.value = leftRef.value.$el.clientWidth;
}

async function onResizeEnd() {
  if (leftRef.value.$el.clientWidth < showLeftThreshold) {
    showLeft.value = false;
  } else {
    showLeft.value = true;
  }
  leftDivSnapshotWidth.value = leftRef.value.$el.clientWidth;
}
</script>
