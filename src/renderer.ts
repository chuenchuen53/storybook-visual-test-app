import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "primevue/themes/Aura";
import "primeicons/primeicons.css";
import "./view/index.css";
import { createPinia } from "pinia";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import App from "./view/App.vue";
import { router } from "./view/routes";

const pinia = createPinia();

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

app.directive("tooltip", Tooltip);
app.use(ToastService);

app.use(pinia);

app.mount("#app");
