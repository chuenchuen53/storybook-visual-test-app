import type { Ref } from "vue";
import { ref, watch } from "vue";

export function useDelayLoading(sourceRef: Ref<boolean>, delay = 500): Ref<boolean> {
  let timeId: number | null = null;
  const delayRef = ref(sourceRef.value);

  watch(
    sourceRef,
    () => {
      if (!sourceRef.value) {
        if (timeId) clearTimeout(timeId);
        delayRef.value = sourceRef.value;
      } else {
        if (timeId) clearTimeout(timeId);
        timeId = window.setTimeout(() => {
          delayRef.value = sourceRef.value;
          timeId = null;
        }, delay);
      }
    },
    {
      immediate: true,
    },
  );

  return delayRef;
}
