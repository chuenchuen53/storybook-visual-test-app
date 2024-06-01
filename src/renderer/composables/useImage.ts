import { ref } from "vue";
import type { Ref } from "vue";

export interface ImageState {
  loading: boolean;
  isExist: boolean | null;
  src: string | null;
}

export type UpdateImgFunction = () => Promise<{ isExist: boolean; src: string | null }>;

export type UpdateImgFromBase64Function = () => Promise<{
  isExist: boolean;
  base64: string | null;
}>;

export interface UseImageReturn {
  imgState: Ref<ImageState>;
  removeImg: () => void;
  updateImg: (fn: UpdateImgFunction | UpdateImgFromBase64Function) => Promise<void>;
}

function getEmptyState(): ImageState {
  return {
    loading: false,
    isExist: null,
    src: null,
  };
}

function getEmptyStateWithLoading(): ImageState {
  return {
    loading: true,
    isExist: null,
    src: null,
  };
}

export function generateSrcFromBase64Png(base64: string | null) {
  return base64 ? "data:image/png;base64," + base64 : null;
}

export function useImage(): UseImageReturn {
  const imgState = ref<ImageState>(getEmptyState());

  const removeImg = () => {
    imgState.value = getEmptyState();
  };

  const updateImg = async (fn: UpdateImgFunction | UpdateImgFromBase64Function) => {
    imgState.value = getEmptyStateWithLoading();
    try {
      const data = await fn();
      const src: string | null = "base64" in data ? generateSrcFromBase64Png(data.base64) : data.src;
      imgState.value = {
        loading: false,
        isExist: data.isExist,
        src,
      };
    } catch (e) {
      imgState.value = getEmptyState();
      console.error(e);
    }
  };

  return {
    imgState,
    removeImg,
    updateImg,
  };
}
