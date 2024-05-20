import { createMemoryHistory, createRouter } from "vue-router";
import ReferencePage from "./page/ReferencePage.vue";
import ScreenshotPage from "./page/ScreenshotPage.vue";
import ComparePage from "./page/ComparePage.vue";

const routes = [
  { path: "/", component: ComparePage },
  { path: "/reference", component: ReferencePage },
  { path: "/screenshot", component: ScreenshotPage },
  { path: "/compare", component: ComparePage },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
