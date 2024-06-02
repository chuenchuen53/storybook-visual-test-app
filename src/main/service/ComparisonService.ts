import type {
  ComparisonResponse,
  GetAvailableSetResponse,
  SaveScreenshotResponse,
  RefTestSetLocationIdentifier,
} from "../../shared/type";

export interface ComparisonService {
  getAvailableSets(project: string): Promise<GetAvailableSetResponse>;
  compare(refSet: RefTestSetLocationIdentifier, testSet: RefTestSetLocationIdentifier): Promise<ComparisonResponse>;
  save(name: string): Promise<SaveScreenshotResponse>;
}
