import { ref } from "vue";
import { generateSrcFromBase64Png } from "./useImage";
import type { StoriesDiffResult, StoryMetadataWithRenderStatus } from "../../shared/type";
import type { ComparisonSummaryImgsProps } from "../components/shared/comparison-summary/type";

interface UpdateParams {
  project: string;
  refBranch: string;
  refSetId: string;
  testBranch: string;
  testSetId: string;
  storyMetadataList: StoryMetadataWithRenderStatus[];
  result: Record<keyof StoriesDiffResult, string[]>;
}

export function useComparisonSummaryImgs() {
  const comparisonSetSummaryImgs = ref<ComparisonSummaryImgsProps>({
    diff: [],
    added: [],
    removed: [],
  });

  const reset = () => {
    comparisonSetSummaryImgs.value = {
      diff: [],
      added: [],
      removed: [],
    };
  };

  const update = async (params: UpdateParams) => {
    const { project, refBranch, refSetId, testBranch, testSetId, storyMetadataList, result } = params;

    const getRefImgFn = (id: string) =>
      window.imgApi.invoke.getSavedScreenshotImg({
        project,
        branch: refBranch,
        setId: refSetId,
        id,
      });
    const getTestImgFn = (id: string) =>
      window.imgApi.invoke.getSavedScreenshotImg({
        project,
        branch: testBranch,
        setId: testSetId,
        id,
      });

    const map = new Map<string, StoryMetadataWithRenderStatus>();
    storyMetadataList.forEach(x => map.set(x.id, x));

    const getTitle = (id: string) => {
      const metadata = map.get(id);
      if (!metadata) return "";
      return metadata.title + "/" + metadata.name;
    };
    const initImgState = () => ({
      loading: true,
      isExist: null,
      src: null,
    });

    comparisonSetSummaryImgs.value.diff = result.diff.map(x => ({
      id: x,
      title: getTitle(x),
      leftImg: initImgState(),
      rightImg: initImgState(),
    }));
    comparisonSetSummaryImgs.value.added = result.added.map(x => ({
      id: x,
      title: getTitle(x),
      img: initImgState(),
    }));
    comparisonSetSummaryImgs.value.removed = result.removed.map(x => ({
      id: x,
      title: getTitle(x),
      img: initImgState(),
    }));

    await Promise.all(
      comparisonSetSummaryImgs.value.diff.map(async (x, i) => {
        const left = await getRefImgFn(x.id);
        const right = await getTestImgFn(x.id);
        comparisonSetSummaryImgs.value.diff[i].leftImg = {
          loading: false,
          isExist: left.isExist,
          src: left.base64 ? generateSrcFromBase64Png(left.base64) : null,
        };
        comparisonSetSummaryImgs.value.diff[i].rightImg = {
          loading: false,
          isExist: right.isExist,
          src: right.base64 ? generateSrcFromBase64Png(right.base64) : null,
        };
      }),
    );
    await Promise.all(
      comparisonSetSummaryImgs.value.added.map(async (x, i) => {
        const img = await getTestImgFn(result.added[i]);
        comparisonSetSummaryImgs.value.added[i].img = {
          loading: false,
          isExist: img.isExist,
          src: img.base64 ? generateSrcFromBase64Png(img.base64) : null,
        };
      }),
    );
    await Promise.all(
      comparisonSetSummaryImgs.value.removed.map(async (x, i) => {
        const img = await getRefImgFn(result.removed[i]);
        comparisonSetSummaryImgs.value.removed[i].img = {
          loading: false,
          isExist: img.isExist,
          src: img.base64 ? generateSrcFromBase64Png(img.base64) : null,
        };
      }),
    );
  };

  return { comparisonSetSummaryImgs, reset, update };
}
