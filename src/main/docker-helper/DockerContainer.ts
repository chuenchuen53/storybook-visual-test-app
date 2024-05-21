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
    screenshot: 6200,
  };
  private static readonly instances: Record<DockerContainerType, DockerContainer> = {
    metadata: new DockerContainer("metadata"),
    screenshot: new DockerContainer("screenshot"),
  };

  private readonly containerNamePrefix: string;
  private readonly startPort: number;
  private containers: ContainerInfo[] = [];

  private constructor(containerType: DockerContainerType) {
    this.containerNamePrefix = `${DockerContainer.COMMON_PREFIX}-${containerType}`;
    this.startPort = DockerContainer.portMap[containerType];
  }

  public static getInstance(containerType: DockerContainerType): DockerContainer {
    return DockerContainer.instances[containerType];
  }

  public getContainerInfo(): ContainerInfo[] {
    // deep clone to prevent being modified
    return this.containers.map(x => ({ ...x }));
  }

  public async start() {
    const containerName = `${this.containerNamePrefix}-${this.containers.length}`;
    const port = this.startPort + this.containers.length;
    const id = await this.startDockerContainer(containerName, port);
    this.containers.push({ id, name: containerName, port });
  }

  public async stop() {
    if (this.containers.length === 0) return;
    const allContainerIds = this.containers.map(x => x.id);
    await execa("docker", ["stop", ...allContainerIds]);
    this.containers = [];
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
