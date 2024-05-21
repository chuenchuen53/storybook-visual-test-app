import type { CompareResponse } from "../../interface";

export interface CompareService {
  compare(refDir: string, testDir: string): Promise<CompareResponse>;
}
