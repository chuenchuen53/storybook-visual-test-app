import { createMemoryHistory, createRouter } from "vue-router";
import ReferencePage from "./pages/ReferencePage.vue";
import ScreenshotPage from "./pages/ScreenshotPage.vue";
import ComparePage from "./pages/ComparePage.vue";
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
