import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "primevue/themes/aura";
import "primeicons/primeicons.css";
import "./index.css";
import { router } from "./view/routes";

const app = createApp(App);
app.use(router);

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      darkModeSelector: ".dark",
      cssLayer: false,
    },
  },
});

app.mount("#app");
