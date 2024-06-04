<template>
  <transition
    name="collapse"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot />
  </transition>
</template>

<script setup lang="ts">
function beforeEnter(x: Element) {
  const element = x as HTMLElement;
  requestAnimationFrame(() => {
    if (!element.style.height) {
      element.style.height = "0px";
    }

    // @ts-ignore
    element.style.display = null;
  });
}

function enter(x: Element) {
  const element = x as HTMLElement;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.height = `${element.scrollHeight}px`;
    });
  });
}

function afterEnter(x: Element) {
  const element = x as HTMLElement;
  // @ts-ignore
  element.style.height = null;
}

function beforeLeave(x: Element) {
  const element = x as HTMLElement;
  requestAnimationFrame(() => {
    if (!element.style.height) {
      element.style.height = `${element.offsetHeight}px`;
    }
  });
}

function leave(x: Element) {
  const element = x as HTMLElement;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.height = "0px";
    });
  });
}

function afterLeave(x: Element) {
  const element = x as HTMLElement;
  // @ts-ignore
  element.style.height = null;
}
</script>

<style>
.collapse-enter-active,
.collapse-leave-active {
  overflow: hidden;
  transition: height 0.2s ease-out;
}
</style>
