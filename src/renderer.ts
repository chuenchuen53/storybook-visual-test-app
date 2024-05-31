import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "primevue/themes/Aura";
import { createPinia } from "pinia";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import Ripple from "primevue/ripple";
import ConfirmationService from "primevue/confirmationservice";
// @ts-ignore
import App from "./renderer/App.vue";
import { router } from "./renderer/routes";
import "primeicons/primeicons.css";
import "./renderer/index.css";

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

app.directive("ripple", Ripple);
app.directive("tooltip", Tooltip);
app.use(ToastService);
app.use(ConfirmationService);

app.use(pinia);

app.mount("#app");
