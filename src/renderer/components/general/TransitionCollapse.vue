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
function beforeEnter(element: HTMLElement) {
  requestAnimationFrame(() => {
    if (!element.style.height) {
      element.style.height = "0px";
    }

    element.style.display = null;
  });
}

function enter(element: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.height = `${element.scrollHeight}px`;
    });
  });
}

function afterEnter(element: HTMLElement) {
  element.style.height = null;
}

function beforeLeave(element: HTMLElement) {
  requestAnimationFrame(() => {
    if (!element.style.height) {
      element.style.height = `${element.offsetHeight}px`;
    }
  });
}

function leave(element: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.height = "0px";
    });
  });
}

function afterLeave(element: HTMLElement) {
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
