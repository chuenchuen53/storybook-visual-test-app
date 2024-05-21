export interface StoriesDiffResult {
  same: string[];
  added: string[];
  removed: string[];
  diff: string[];
}

export interface StoriesDiffer {
  computeDiff(refDir: string, testDir: string, tolerance: number): Promise<StoriesDiffResult>;
}
