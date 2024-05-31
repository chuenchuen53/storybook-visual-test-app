import { ref } from "vue";
import { useImage } from "./useImage";
import type { Ref, UnwrapRef } from "vue";
import type { UpdateImgFunction, UpdateImgFromBase64Function, ImageState } from "./useImage";
import type { StoriesDiffResult } from "../../shared/type";

type UpdateFn = UpdateImgFunction | UpdateImgFromBase64Function;

export interface ComparisonImageState {
  type: Ref<UnwrapRef<keyof StoriesDiffResult | null>>;
  diffImg: Ref<ImageState>;
  refImg: Ref<ImageState>;
  testImg: Ref<ImageState>;
}

interface UseComparisonImageReturn {
  comparisonImageState: Ref<UnwrapRef<ComparisonImageState>>;
  resetImgs: () => void;
  setSameImg: (refUpdateFn: UpdateFn, testUpdateFn: UpdateFn) => Promise<void>;
  setAddedImg: (fn: UpdateFn) => Promise<void>;
  setRemovedImg: (fn: UpdateFn) => Promise<void>;
  setDiffImg: (refUpdateFn: UpdateFn, testUpdateFn: UpdateFn, diffUpdateFn: UpdateFn) => Promise<void>;
}

export function useComparisonImage(): UseComparisonImageReturn {
  const displayingType = ref<keyof StoriesDiffResult | null>(null);
  const refImg = useImage();
  const testImg = useImage();
  const diffImg = useImage();

  const comparisonImageState = ref<ComparisonImageState>({
    type: displayingType,
    refImg: refImg.imgState,
    testImg: testImg.imgState,
    diffImg: diffImg.imgState,
  });

  const resetImgs = () => {
    displayingType.value = null;
    refImg.removeImg();
    testImg.removeImg();
    diffImg.removeImg();
  };

  const setSameImg = async (refUpdateFn: UpdateFn, testUpdateFn: UpdateFn) => {
    displayingType.value = "same";
    diffImg.removeImg();
    await Promise.all([refImg.updateImg(refUpdateFn), testImg.updateImg(testUpdateFn)]);
  };

  const setAddedImg = async (fn: UpdateFn) => {
    displayingType.value = "added";
    refImg.removeImg();
    diffImg.removeImg();
    await testImg.updateImg(fn);
  };

  const setRemovedImg = async (fn: UpdateFn) => {
    displayingType.value = "removed";
    testImg.removeImg();
    diffImg.removeImg();
    await refImg.updateImg(fn);
  };

  const setDiffImg = async (refUpdateFn: UpdateFn, testUpdateFn: UpdateFn, diffUpdateFn: UpdateFn) => {
    displayingType.value = "diff";
    await Promise.all([
      refImg.updateImg(refUpdateFn),
      testImg.updateImg(testUpdateFn),
      diffImg.updateImg(diffUpdateFn),
    ]);
  };

  return {
    comparisonImageState,
    resetImgs,
    setSameImg,
    setAddedImg,
    setRemovedImg,
    setDiffImg,
  };
}
