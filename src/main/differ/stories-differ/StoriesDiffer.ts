import type { StoriesDiffResult } from "../../../shared/type";

export interface StoriesDiffer {
  computeDiff(refDir: string, testDir: string, tolerance: number): Promise<StoriesDiffResult>;
}
