import { createMemoryHistory, createRouter } from "vue-router";
import HomePage from "./page/HomePage.vue";
import AboutPage from "./page/AboutPage.vue";

const routes = [
  { path: "/", component: HomePage },
  { path: "/about", component: AboutPage },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
