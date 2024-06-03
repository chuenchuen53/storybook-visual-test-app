import execa from "execa";
import { CHROME_IMAGE } from "./docker-image";

export type DockerContainerType = "metadata" | "screenshot";

export interface ContainerInfo {
  id: string;
  name: string;
  port: number;
}

export class DockerContainer {
  private static readonly COMMON_PREFIX = "visual-test-app";
  private static readonly portMap: Record<DockerContainerType, number> = {
    metadata: 6100,
    screenshot: 6101,
  };
  private static readonly instances: Record<DockerContainerType, DockerContainer> = {
    metadata: new DockerContainer("metadata"),
    screenshot: new DockerContainer("screenshot"),
  };

  private readonly containerName: string;
  private readonly port: number;
  private info: ContainerInfo | null = null;

  public static getInstance(containerType: DockerContainerType): DockerContainer {
    return DockerContainer.instances[containerType];
  }

  public static async ensureAllStopped() {
    const { stdout } = await execa("docker", ["ps", "-qf", `name=${DockerContainer.COMMON_PREFIX}`]);
    const allContainerIds = stdout
      .trim()
      .split("\n")
      .filter(x => x !== "");
    if (allContainerIds.length === 0) return;
    await execa("docker", ["stop", ...allContainerIds]);
    DockerContainer.instances.metadata.info = null;
    DockerContainer.instances.screenshot.info = null;
  }

  private constructor(containerType: DockerContainerType) {
    this.containerName = `${DockerContainer.COMMON_PREFIX}-${containerType}`;
    this.port = DockerContainer.portMap[containerType];
  }

  public getContainerInfo(): ContainerInfo | null {
    // deep clone to prevent being modified
    return this.info ? { ...this.info } : null;
  }

  public async start() {
    if (this.info !== null) return;
    const containerName = `${this.containerName}`;
    const id = await this.startDockerContainer(containerName, this.port);
    this.info = { id, name: containerName, port: this.port };
  }

  public async stop() {
    if (this.info === null) return;
    await execa("docker", ["stop", this.info.id]);
    this.info = null;
  }

  /**
   *
   * @returns container id
   */
  private async startDockerContainer(containerName: string, mapPort: number): Promise<string> {
    const { stdout } = await execa("docker", [
      "run",
      "--rm",
      "-d",
      "--shm-size=1024m",
      "--cap-add=SYS_ADMIN",
      "--name",
      containerName,
      "-p",
      `${mapPort}:9222`,
      CHROME_IMAGE,
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
    ]);
    return stdout;
  }
}
