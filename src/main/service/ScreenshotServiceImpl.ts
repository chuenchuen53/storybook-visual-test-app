import os from "os";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { CrawlerImpl } from "../crawler/CrawlerImpl";
import { isDockerAvailable } from "../docker-helper/is-docker-available";
import { checkDockerImage, pullDockerImage } from "../docker-helper/docker-image";
import { FilepathHelper } from "../Filepath";
import { ScreenshotState } from "../../shared/type";
import { GlobalChannel } from "../message-emitter/GlobalChannel";
import { ScreenshotChannel } from "../message-emitter/ScreenshotChannel";
import { Log } from "../decorator/Log";
import { CatchError, HandledError } from "../decorator/CatchError";
import { TempScreenshotMetadataHelper } from "../persistence/TempScreenshotMetadataHelper";
import { SavedScreenshotMetadataHelper } from "../persistence/SavedScreenshotMetadataHelper";
import { sumPngFileSize } from "../utils";
import { LogError } from "../decorator/LogError";
import type {
  SavedScreenshotMetadata,
  SaveScreenshotResponse,
  StoryMetadata,
  StoryMetadataWithRenderStatus,
  TempScreenshotMetadata,
  Viewport,
} from "../../shared/type";
import type { ScreenshotService } from "./ScreenshotService";
import type { Crawler } from "../crawler/Crawler";

export class ScreenshotServiceImpl implements ScreenshotService {
  private static readonly instance: ScreenshotService = new ScreenshotServiceImpl();

  public static getInstance(): ScreenshotService {
    return ScreenshotServiceImpl.instance;
  }

  private constructor() {}

  @LogError()
  public getLocalIPAddress(): string | undefined {
    const interfaces = os.networkInterfaces();
    const ips = Object.keys(interfaces)
      .map(
        key =>
          interfaces[key]
            ?.filter(({ family, internal }) => family === "IPv4" && !internal)
            .map(({ address }) => address) ?? [],
      )
      .reduce((acc, current) => acc.concat(current), []);
    return ips[0];
  }

  @CatchErrorInformRenderer("Fail to take screenshot", false)
  @Log()
  public async createNewSet(storybookUrl: string, viewport: Viewport, concurrency: number): Promise<void> {
    await this.checkDockerAvailability();
    await this.ensureDockerImage();

    await fs.emptydir(FilepathHelper.tempScreenshotDir());

    ScreenshotChannel.updateStatus(ScreenshotState.PREPARING_METADATA_BROWSER);
    const storyMetadataList = await this.getStoryMetadataList(storybookUrl);

    ScreenshotChannel.newMetadata(storyMetadataList);
    ScreenshotChannel.updateStatus(ScreenshotState.PREPARING_SCREENSHOT_BROWSER);

    const storyScreenshotMetadataList = await this.screenshotStories(
      storyMetadataList,
      storybookUrl,
      viewport,
      concurrency,
    );

    const id = uuidv4();
    const saveMetaData: TempScreenshotMetadata = {
      id,
      createdAt: new Date().toISOString(),
      viewport,
      storyMetadataList: storyScreenshotMetadataList,
    };
    await TempScreenshotMetadataHelper.save(saveMetaData);

    ScreenshotChannel.updateStatus(ScreenshotState.FINISHED);
  }

  @CatchError<SaveScreenshotResponse>({ success: false, errMsg: "Fail to save screenshot" })
  @Log()
  public async save(project: string, branch: string, name: string): Promise<SaveScreenshotResponse> {
    const metadata = await TempScreenshotMetadataHelper.read();
    if (metadata === null) return { success: false, errMsg: "Fail to read metadata" };

    const { id, createdAt, viewport, storyMetadataList } = metadata;

    const srcDir = FilepathHelper.tempScreenshotDir();
    const destDir = FilepathHelper.savedScreenshotSetDir(project, branch, id);
    await fs.ensureDir(destDir);
    await fs.copy(srcDir, destDir, { overwrite: true });

    const size = await sumPngFileSize(destDir);

    const savedScreenshotSetMetadata: SavedScreenshotMetadata = {
      id,
      createdAt,
      viewport,
      project,
      branch,
      name,
      size,
      storyMetadataList,
    };
    await SavedScreenshotMetadataHelper.save(savedScreenshotSetMetadata);

    return { success: true };
  }

  @CatchErrorInformRenderer()
  @Log()
  private async checkDockerAvailability(): Promise<void> {
    if (!isDockerAvailable()) throw new Error("Docker is not available");
  }

  @CatchErrorInformRenderer()
  @Log()
  private async ensureDockerImage(): Promise<void> {
    const isDockerImageAvailable = await checkDockerImage();
    if (!isDockerImageAvailable) {
      await pullDockerImage();
    }
  }

  @CatchErrorInformRenderer("Fail to get stories metadata.")
  @Log()
  private async getStoryMetadataList(url: string): Promise<StoryMetadata[]> {
    const crawler: Crawler = CrawlerImpl.getInstance();
    const { storyMetadataList } = await crawler.getStoriesMetadata(url, () =>
      ScreenshotChannel.updateStatus(ScreenshotState.COMPUTING_METADATA),
    );

    return storyMetadataList;
  }

  @CatchErrorInformRenderer("Fail to take screenshot.")
  @Log()
  private async screenshotStories(
    storyMetadataList: StoryMetadata[],
    storybookUrl: string,
    viewport: Viewport,
    concurrency: number,
  ): Promise<StoryMetadataWithRenderStatus[]> {
    const crawler: Crawler = CrawlerImpl.getInstance();
    const result = await crawler.screenshotStories(
      storybookUrl,
      storyMetadataList,
      viewport,
      concurrency,
      () => ScreenshotChannel.updateStatus(ScreenshotState.CAPTURING_SCREENSHOT),
      (storyId, state, browserName, storyErr) =>
        ScreenshotChannel.updateStoryState({ storyId, state, browserName, storyErr }),
    );

    return result.storyScreenshotMetadataList;
  }
}

function CatchErrorInformRenderer(errMsg?: string, rethrow: boolean | "handled" = "handled") {
  return CatchError(e => {
    if (!(e instanceof HandledError)) {
      const message = errMsg ?? (e instanceof Error ? e.message : "Non-Error type");
      GlobalChannel.sendGlobalMessage({ type: "error", message });
      ScreenshotChannel.updateStatus(ScreenshotState.FAILED);
    }
  }, rethrow);
}
