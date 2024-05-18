export interface ImgDiffer {
  isSame(
    refPath: string,
    testPath: string,
    diffPath: string,
    tolerance: number,
  ): Promise<boolean>;
}
