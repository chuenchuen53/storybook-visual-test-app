import { defineStore } from "pinia";
import theme from "tailwindcss/defaultTheme";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";

export const useGlobalStore = defineStore("global", () => {
  const toast = useToast();

  const todo = ref("");

  window.globalApi.onReceiveGlobalMessage(msg => {
    toast.add({
      severity: msg.type,
      summary: msg.type,
      detail: msg.message,
      life: 5000,
    });
  });

  return { todo };
});
