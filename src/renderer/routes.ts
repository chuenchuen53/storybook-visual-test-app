// @ts-nocheck

import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const ReferencePage = import("./pages/ReferencePage.vue");
const ScreenshotPage = import("./pages/ScreenshotPage.vue");
const ComparePage = import("./pages/ComparePage.vue");

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: { path: "/screenshot" } },
  { path: "/reference", component: ReferencePage },
  { path: "/screenshot", component: ScreenshotPage },
  { path: "/compare", component: ComparePage },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
