import type { ComparisonResponse, SaveScreenshotResponse, RefTestSetLocationIdentifier } from "../../shared/type";

export interface ComparisonService {
  compare(refSet: RefTestSetLocationIdentifier, testSet: RefTestSetLocationIdentifier): Promise<ComparisonResponse>;
  save(name: string): Promise<SaveScreenshotResponse>;
}
