import { defineStore } from "pinia";
import { ref } from "vue";

export const useLightboxStore = defineStore("lightbox", () => {
  const visible = ref(false);
  const img = ref<string | null>(null);

  const open = (imgUrl: string) => {
    img.value = imgUrl;
    visible.value = true;
  };

  const close = () => {
    img.value = null;
    visible.value = false;
  };

  return {
    visible,
    img,
    open,
    close,
  };
});
