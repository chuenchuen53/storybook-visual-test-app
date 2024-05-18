import { PNG } from "pngjs";
import fs from "fs-extra";
import pixelmatch from "pixelmatch";
import type { ImgDiffer } from "./ImgDiffer";

type RgbTuple = [number, number, number];

export class PixelmatchDiffer implements ImgDiffer {
  /**
   * The color of anti-aliased pixels in the diff output
   */
  private static readonly AA_COLOR: RgbTuple = [252, 233, 106];

  /**
   * The color of differing pixels in the diff output
   */
  private static readonly DIFF_COLOR: RgbTuple = [240, 82, 82];

  /**
   * An alternative color to use for dark on light differences to differentiate between "added" and "removed" parts
   */
  private static readonly DIFF_COLOR_ALT: RgbTuple = [248, 180, 180];

  public async isSame(refPath: string, testPath: string, diffPath: string, tolerance: number): Promise<boolean> {
    const [refFile, testFile] = await Promise.all([fs.readFile(refPath), fs.readFile(testPath)]);
    let refImg: PNG = PNG.sync.read(refFile);
    let testImg: PNG = PNG.sync.read(testFile);

    const width = Math.max(refImg.width, testImg.width);
    const height = Math.max(refImg.height, testImg.height);

    if (refImg.width !== testImg.width || refImg.height !== testImg.height) {
      refImg = this.resizeImage(refImg, width, height);
      testImg = this.resizeImage(testImg, width, height);
    }

    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(refImg.data, testImg.data, diff.data, width, height, {
      threshold: tolerance / 100,
      aaColor: PixelmatchDiffer.AA_COLOR,
      diffColor: PixelmatchDiffer.DIFF_COLOR,
      diffColorAlt: PixelmatchDiffer.DIFF_COLOR_ALT,
    });
    if (numDiffPixels === 0) {
      return true;
    }

    const buffer = PNG.sync.write(diff);
    await fs.writeFile(diffPath, buffer);
    return false;
  }

  private resizeImage(original: PNG, width: number, height: number) {
    const resized = new PNG({ width, height, fill: true });
    PNG.bitblt(original, resized, 0, 0, original.width, original.height, 0, 0);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y > original.height || x > original.width) {
          const idx = (width * y + x) << 2;
          resized.data[idx] = 0;
          resized.data[idx + 1] = 0;
          resized.data[idx + 2] = 0;
          resized.data[idx + 3] = 64;
        }
      }
    }
    return resized;
  }
}
