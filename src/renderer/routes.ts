// @ts-nocheck

import type { RouteRecordRaw } from "vue-router";
import { createMemoryHistory, createRouter } from "vue-router";

const SavedSetPage = () => import("./pages/SavedSetPage.vue");
const ScreenshotPage = () => import("./pages/ScreenshotPage.vue");
const ComparisonPage = () => import("./pages/ComparisonPage.vue");

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: { path: "/saved-set" } },
  { path: "/saved-set", component: SavedSetPage },
  { path: "/screenshot", component: ScreenshotPage },
  { path: "/comparison", component: ComparisonPage },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
