import { createMemoryHistory, createRouter } from "vue-router";
import ReferencePage from "./page/ReferencePage.vue";
import ScreenshotPage from "./page/ScreenshotPage.vue";
import ComparePage from "./page/ComparePage.vue";
import type { RouteRecordRaw } from "vue-router";

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
